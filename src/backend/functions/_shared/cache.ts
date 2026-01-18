/**
 * Caching layer for YouTube search results using Supabase.
 *
 * Provides versioned, hashed cache keys with pagination awareness.
 * Keys are SHA-256 hashes of "v1:normalized_query|locale|pageToken".
 */

import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { captureError } from "./sentry.ts";

// =============================================================================
// Constants
// =============================================================================

const CACHE_KEY_VERSION = "v1";
const CACHE_TTL_HOURS = 24;

export const ErrorCodes = {
    DATABASE_ERROR: "CACHE_DATABASE_ERROR",
    INVALID_DATA: "CACHE_INVALID_DATA",
    CLIENT_ERROR: "CACHE_CLIENT_ERROR",
} as const;

// =============================================================================
// Types
// =============================================================================

export interface CachedVideo {
    video_id: string;
    title: string;
    channel_title: string;
    thumbnail_url: string;
}

export interface CachedSearchResults {
    videos: CachedVideo[];
    nextPageToken: string | null;
    totalResults: number;
}

export interface CacheLookupResult {
    data: CachedSearchResults | null;
    cached: boolean;
}

export interface CacheClientOptions {
    supabaseUrl?: string;
    supabaseServiceKey?: string;
    createClientFn?: typeof createClient;
}

export interface DeleteCacheOptions {
    onError?: (error: Error, context: Record<string, string>) => Promise<void>;
}

// =============================================================================
// Zod Schema for Cached Data Validation
// =============================================================================

const CachedVideoSchema = z.object({
    video_id: z.string(),
    title: z.string(),
    channel_title: z.string(),
    thumbnail_url: z.string(),
});

const CachedSearchResultsSchema = z.object({
    videos: z.array(CachedVideoSchema),
    nextPageToken: z.string().nullable(),
    totalResults: z.number(),
});

// =============================================================================
// Error Class
// =============================================================================

export class CacheError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly retryable: boolean
    ) {
        super(message);
        this.name = "CacheError";
    }

    toJSON() {
        return {
            error: this.message,
            code: this.code,
            retryable: this.retryable,
        };
    }
}

// =============================================================================
// Cache Key Normalization
// =============================================================================

/**
 * Normalizes query + locale + pageToken into a versioned SHA-256 hashed cache key.
 *
 * 1. Normalize: lowercase, trim, collapse whitespace
 * 2. Build canonical string: "v1:query|locale|pageToken"
 * 3. Hash with SHA-256 for fixed-length, collision-safe keys
 *
 * The version prefix ensures future normalization changes don't silently collide
 * with old cache entries.
 *
 * NOTE: This function is async due to crypto.subtle.digest. All callers must await.
 *
 * @example
 * await normalizeQueryKey("Pasta", "en-US", undefined) => "a1b2c3..."  (64 char hex)
 * await normalizeQueryKey("Pasta", "en-US", "TOKEN123") => "d4e5f6..." (different hash)
 */
export async function normalizeQueryKey(
    query: string,
    locale?: string,
    pageToken?: string
): Promise<string> {
    const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
    const normalizedLocale = (locale ?? "").toLowerCase();
    const normalizedPageToken = pageToken ?? "";

    // Version prefix for future-proofing
    const canonical = `${CACHE_KEY_VERSION}:${normalized}|${normalizedLocale}|${normalizedPageToken}`;

    // SHA-256 hash for fixed-length, safe keys
    const encoder = new TextEncoder();
    const data = encoder.encode(canonical);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// =============================================================================
// Supabase Client Factory
// =============================================================================

/**
 * Creates a Supabase client for cache operations.
 *
 * Accepts optional overrides for testability via dependency injection.
 *
 * @throws {CacheError} When SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing
 */
export function createCacheClient(options: CacheClientOptions = {}): SupabaseClient {
    const url = options.supabaseUrl ?? Deno.env.get("SUPABASE_URL");
    const key = options.supabaseServiceKey ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const factory = options.createClientFn ?? createClient;

    if (!url || !key) {
        throw new CacheError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
            ErrorCodes.CLIENT_ERROR,
            false
        );
    }

    return factory(url, key);
}

// =============================================================================
// Cache Operations
// =============================================================================

/**
 * Looks up cached search results by query key.
 *
 * Returns cached data only if:
 * - Entry exists in database
 * - Entry has not expired (expires_at > now)
 * - Cached JSON passes Zod validation
 *
 * If cached data fails validation, the corrupted entry is deleted.
 *
 * @param supabaseClient - Supabase client instance
 * @param queryKey - Hashed cache key from normalizeQueryKey()
 * @returns CacheLookupResult with data and cached flag
 * @throws {CacheError} On database errors
 */
export async function getCachedResults(
    supabaseClient: SupabaseClient,
    queryKey: string
): Promise<CacheLookupResult> {
    const now = new Date().toISOString();

    const { data, error } = await supabaseClient
        .from("search_cache")
        .select("results_json, expires_at")
        .eq("query_key", queryKey)
        .gt("expires_at", now)
        .maybeSingle();

    if (error) {
        throw new CacheError(
            `Database error: ${error.message}`,
            ErrorCodes.DATABASE_ERROR,
            true
        );
    }

    if (!data) {
        return { data: null, cached: false };
    }

    // Validate cached data with Zod
    const parsed = CachedSearchResultsSchema.safeParse(data.results_json);
    if (!parsed.success) {
        // Delete corrupted entry
        await deleteCachedResult(supabaseClient, queryKey);
        return { data: null, cached: false };
    }

    return { data: parsed.data, cached: true };
}

/**
 * Stores search results in cache with 24-hour TTL.
 *
 * Uses upsert to handle both inserts and updates.
 * Expiration is calculated as now + 24 hours.
 *
 * @param supabaseClient - Supabase client instance
 * @param queryKey - Hashed cache key from normalizeQueryKey()
 * @param results - Search results to cache
 * @throws {CacheError} On database errors
 */
export async function setCachedResults(
    supabaseClient: SupabaseClient,
    queryKey: string,
    results: CachedSearchResults
): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000);

    const { error } = await supabaseClient
        .from("search_cache")
        .upsert(
            {
                query_key: queryKey,
                results_json: results,
                expires_at: expiresAt.toISOString(),
            },
            { onConflict: "query_key" }
        );

    if (error) {
        throw new CacheError(
            `Database error: ${error.message}`,
            ErrorCodes.DATABASE_ERROR,
            true
        );
    }
}

/**
 * Deletes a cache entry by query key.
 *
 * Used for:
 * - Removing corrupted entries detected during getCachedResults
 * - Manual cache invalidation
 *
 * Errors are logged to Sentry but not thrown (fire-and-forget pattern).
 *
 * @param supabaseClient - Supabase client instance
 * @param queryKey - Hashed cache key to delete
 * @param options - Optional configuration (onError callback for testing)
 */
export async function deleteCachedResult(
    supabaseClient: SupabaseClient,
    queryKey: string,
    options?: DeleteCacheOptions
): Promise<void> {
    const { error } = await supabaseClient
        .from("search_cache")
        .delete()
        .eq("query_key", queryKey);

    if (error) {
        const err = new Error(`Failed to delete cache entry: ${error.message}`);
        const context = { queryKey, operation: "cache_delete" };

        if (options?.onError) {
            await options.onError(err, context);
        } else {
            // Use Sentry for consistency with other error handling
            await captureError(err, context);
        }
    }
}
