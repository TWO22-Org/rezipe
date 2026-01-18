/**
 * GET /search Edge Function
 *
 * Searches for recipe-focused YouTube videos with caching layer.
 * Returns cached results when available, falls back to YouTube API.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { captureError, initSentry } from "../_shared/sentry.ts";
import { searchYouTube, YouTubeAPIError } from "../_shared/youtube.ts";
import {
    normalizeQueryKey,
    getCachedResults,
    setCachedResults,
} from "../_shared/cache.ts";

// =============================================================================
// Constants
// =============================================================================

const YOUTUBE_TIMEOUT_MS = 5000;

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ErrorCodes = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
    INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

// =============================================================================
// Request Validation Schema
// =============================================================================

const SearchParamsSchema = z.object({
    q: z.string().trim().min(1, "Search query is required"),
    locale: z.string().optional(),
    pageToken: z.string().optional(),
});

// =============================================================================
// Response Helpers
// =============================================================================

function jsonResponse(
    body: Record<string, unknown>,
    status: number
): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...CORS_HEADERS,
            "content-type": "application/json",
        },
    });
}

function errorResponse(
    error: string,
    code: string,
    retryable: boolean,
    status: number
): Response {
    return jsonResponse({ error, code, retryable }, status);
}

// =============================================================================
// Main Handler
// =============================================================================

export async function handleRequest(req: Request): Promise<Response> {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: CORS_HEADERS,
        });
    }

    // Only allow GET requests
    if (req.method !== "GET") {
        return errorResponse(
            "Method not allowed",
            ErrorCodes.METHOD_NOT_ALLOWED,
            false,
            405
        );
    }

    // Parse and validate query parameters
    const url = new URL(req.url);
    const params = {
        q: url.searchParams.get("q") ?? "",
        locale: url.searchParams.get("locale") ?? undefined,
        pageToken: url.searchParams.get("pageToken") ?? undefined,
    };

    const validation = SearchParamsSchema.safeParse(params);
    if (!validation.success) {
        const message = validation.error.errors[0]?.message ?? "Invalid request";
        return errorResponse(message, ErrorCodes.VALIDATION_ERROR, false, 400);
    }

    const { q: query, locale, pageToken } = validation.data;

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
        await captureError(new Error("Missing Supabase credentials"), {
            surface: "edge",
            feature: "search",
            flow: "init",
        });
        return errorResponse(
            "Server configuration error",
            ErrorCodes.INTERNAL_ERROR,
            true,
            500
        );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate cache key
    const queryKey = await normalizeQueryKey(query, locale, pageToken);

    // Try cache lookup
    try {
        const cached = await getCachedResults(supabase, queryKey);
        if (cached.cached && cached.data) {
            return jsonResponse({ ...cached.data, cached: true }, 200);
        }
    } catch (error) {
        // Fire-and-forget: Log cache read error but continue to YouTube without blocking
        captureError(error, {
            surface: "edge",
            feature: "search",
            flow: "cache_read",
            queryKey,
        }).catch(() => {});
    }

    // Cache miss - call YouTube API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), YOUTUBE_TIMEOUT_MS);

    try {
        const result = await searchYouTube({
            query,
            locale,
            pageToken,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Fire-and-forget cache write
        setCachedResults(supabase, queryKey, result).catch(async (error) => {
            await captureError(error, {
                surface: "edge",
                feature: "search",
                flow: "cache_write",
                queryKey,
            });
        });

        return jsonResponse({ ...result, cached: false }, 200);
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle YouTube API errors
        if (error instanceof YouTubeAPIError) {
            return jsonResponse(error.toJSON(), error.statusCode ?? 500);
        }

        // Unknown error
        await captureError(error, {
            surface: "edge",
            feature: "search",
            flow: "youtube_call",
        });

        return errorResponse(
            "An unexpected error occurred",
            ErrorCodes.INTERNAL_ERROR,
            true,
            500
        );
    }
}

// =============================================================================
// Edge Function Entry Point
// =============================================================================

initSentry();

serve(handleRequest);
