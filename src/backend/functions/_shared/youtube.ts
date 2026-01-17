/**
 * YouTube Data API v3 client for Supabase Edge Functions.
 *
 * Biases search results toward recipe/cooking content using:
 * - Query augmentation: appends "recipe OR cooking"
 * - Category restriction: How-to & Style (id=26)
 * - SafeSearch: strict
 */

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// =============================================================================
// Constants
// =============================================================================

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const HOW_TO_CATEGORY_ID = "26";
const DEFAULT_MAX_RESULTS = 20;
const MIN_RESULTS = 1;
const MAX_RESULTS = 50;
const RECIPE_BIAS_TERMS = ["recipe", "cooking"] as const;

export const ErrorCodes = {
    QUOTA_EXCEEDED: "YOUTUBE_QUOTA_EXCEEDED",
    RATE_LIMITED: "YOUTUBE_RATE_LIMITED",
    INVALID_API_KEY: "YOUTUBE_INVALID_API_KEY",
    INVALID_REQUEST: "YOUTUBE_INVALID_REQUEST",
    NETWORK_ERROR: "YOUTUBE_NETWORK_ERROR",
    VALIDATION_ERROR: "YOUTUBE_VALIDATION_ERROR",
    UNKNOWN_ERROR: "YOUTUBE_UNKNOWN_ERROR",
} as const;

// =============================================================================
// Types
// =============================================================================

export interface YouTubeSearchParams {
    query: string;
    locale?: string;
    pageToken?: string;
    maxResults?: number;
}

export interface YouTubeVideo {
    video_id: string;
    title: string;
    channel_title: string;
    thumbnail_url: string;
}

export interface YouTubeSearchResult {
    videos: YouTubeVideo[];
    nextPageToken: string | null;
    totalResults: number;
}

// =============================================================================
// Zod Schema for YouTube API Response
// =============================================================================

const YouTubeSearchResponseSchema = z.object({
    kind: z.string(),
    nextPageToken: z.string().optional(),
    pageInfo: z.object({
        totalResults: z.number(),
        resultsPerPage: z.number(),
    }),
    items: z.array(
        z.object({
            id: z.object({ videoId: z.string().optional() }),
            snippet: z.object({
                title: z.string(),
                channelTitle: z.string(),
                thumbnails: z.object({
                    high: z.object({ url: z.string() }).optional(),
                    medium: z.object({ url: z.string() }).optional(),
                    default: z.object({ url: z.string() }).optional(),
                }),
            }),
        })
    ),
});

type YouTubeAPIResponse = z.infer<typeof YouTubeSearchResponseSchema>;

// =============================================================================
// Error Class
// =============================================================================

export class YouTubeAPIError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly retryable: boolean,
        public readonly statusCode?: number
    ) {
        super(message);
        this.name = "YouTubeAPIError";
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
// Query Augmentation
// =============================================================================

/**
 * Augments search query with recipe bias terms.
 * Skips augmentation if query already contains "recipe" or "cooking".
 */
export function augmentQuery(query: string): string {
    const trimmed = query.trim();
    const lower = trimmed.toLowerCase();

    // Don't over-augment if already recipe-focused
    if (RECIPE_BIAS_TERMS.some((term) => lower.includes(term))) {
        return trimmed;
    }

    return `${trimmed} ${RECIPE_BIAS_TERMS.join(" OR ")}`;
}

// =============================================================================
// URL Builder
// =============================================================================

/**
 * Clamps maxResults to YouTube's valid range (1-50).
 */
export function clampMaxResults(value: number | undefined): number {
    const n = value ?? DEFAULT_MAX_RESULTS;
    return Math.max(MIN_RESULTS, Math.min(MAX_RESULTS, n));
}

/**
 * Parses a BCP-47 locale string and extracts only the country/region code.
 * Returns the region only if explicitly provided (not derived from language).
 *
 * Examples:
 *   - "en-US" → "US"
 *   - "pt-BR" → "BR"
 *   - "zh-Hans-CN" → "CN"
 *   - "it" → null (no explicit region)
 *   - "en" → null (no explicit region)
 */
export function parseRegionFromLocale(locale: string): string | null {
    const parts = locale.split(/[-_]/);

    // Find region: look for a 2-letter part after the language
    // BCP-47 format: language[-script][-region]
    for (let i = 1; i < parts.length; i++) {
        // Region codes are 2-letter alpha (e.g., US, BR, CN)
        if (/^[A-Za-z]{2}$/.test(parts[i])) {
            return parts[i].toUpperCase();
        }
    }

    return null;
}

/**
 * Builds YouTube Search API URL with all required parameters.
 *
 * Note: We always use relevanceLanguage="en" to:
 * - Bias results toward English videos
 * - Reduce translation complexity for the app
 */
export function buildSearchURL(params: YouTubeSearchParams, apiKey: string): string {
    const searchParams = new URLSearchParams({
        key: apiKey,
        part: "snippet",
        q: augmentQuery(params.query),
        type: "video",
        videoCategoryId: HOW_TO_CATEGORY_ID,
        safeSearch: "strict",
        videoEmbeddable: "true",
        videoSyndicated: "true",
        relevanceLanguage: "en",
        maxResults: String(clampMaxResults(params.maxResults)),
    });

    // Only set regionCode if an explicit country is provided (e.g., en-US → US)
    if (params.locale) {
        const region = parseRegionFromLocale(params.locale);
        if (region) {
            searchParams.set("regionCode", region);
        }
    }

    if (params.pageToken) {
        searchParams.set("pageToken", params.pageToken);
    }

    return `${YOUTUBE_SEARCH_URL}?${searchParams.toString()}`;
}

// =============================================================================
// Error Handler
// =============================================================================

async function handleAPIError(response: Response): Promise<never> {
    const body = await response.json().catch(() => null);
    const reason = body?.error?.errors?.[0]?.reason;
    const message = body?.error?.message ?? response.statusText;
    const status = response.status;

    // HTTP 400 - Bad Request (invalid params, malformed request)
    if (status === 400) {
        throw new YouTubeAPIError(message, ErrorCodes.INVALID_REQUEST, false, status);
    }

    // HTTP 403 with quotaExceeded reason
    if (status === 403 && reason === "quotaExceeded") {
        throw new YouTubeAPIError(message, ErrorCodes.QUOTA_EXCEEDED, false, status);
    }

    // HTTP 429 - Rate Limited
    if (status === 429) {
        throw new YouTubeAPIError(message, ErrorCodes.RATE_LIMITED, true, status);
    }

    // HTTP 401/403 - Authentication/Authorization
    if (status === 401 || status === 403) {
        throw new YouTubeAPIError(message, ErrorCodes.INVALID_API_KEY, false, status);
    }

    // Other errors - retryable if server error (5xx)
    throw new YouTubeAPIError(message, ErrorCodes.UNKNOWN_ERROR, status >= 500, status);
}

// =============================================================================
// Response Transformer
// =============================================================================

/**
 * Transforms YouTube API response to app format.
 * Filters out items without videoId and extracts required fields.
 */
export function transformResponse(response: YouTubeAPIResponse): YouTubeSearchResult {
    return {
        videos: response.items
            .filter((item) => item.id.videoId)
            .map((item) => ({
                video_id: item.id.videoId!,
                title: item.snippet.title,
                channel_title: item.snippet.channelTitle,
                thumbnail_url:
                    item.snippet.thumbnails.high?.url ??
                    item.snippet.thumbnails.medium?.url ??
                    item.snippet.thumbnails.default?.url ??
                    "",
            })),
        nextPageToken: response.nextPageToken ?? null,
        totalResults: response.pageInfo.totalResults,
    };
}

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Searches YouTube for recipe-biased video content.
 *
 * @throws {YouTubeAPIError} On API errors with appropriate error codes
 */
export async function searchYouTube(
    params: YouTubeSearchParams
): Promise<YouTubeSearchResult> {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
        throw new YouTubeAPIError(
            "YouTube API key not configured",
            ErrorCodes.INVALID_API_KEY,
            false
        );
    }

    if (!params.query?.trim()) {
        throw new YouTubeAPIError(
            "Search query is required",
            ErrorCodes.INVALID_REQUEST,
            false
        );
    }

    const url = buildSearchURL(params, apiKey);

    let response: Response;
    try {
        response = await fetch(url, {
            headers: { Accept: "application/json" },
        });
    } catch (error) {
        throw new YouTubeAPIError(
            `Network error: ${error instanceof Error ? error.message : "Unknown"}`,
            ErrorCodes.NETWORK_ERROR,
            true
        );
    }

    if (!response.ok) {
        await handleAPIError(response);
    }

    const data = await response.json();
    const parsed = YouTubeSearchResponseSchema.safeParse(data);

    if (!parsed.success) {
        throw new YouTubeAPIError(
            `Invalid response: ${parsed.error.message}`,
            ErrorCodes.VALIDATION_ERROR,
            false
        );
    }

    return transformResponse(parsed.data);
}
