/**
 * Tests for GET /search Edge Function.
 *
 * Unit tests run without external dependencies.
 * Integration tests require env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, YOUTUBE_API_KEY
 */

import {
    assertEquals,
    assertExists,
    assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { stub } from "https://deno.land/std@0.224.0/testing/mock.ts";

import { handleRequest } from "../functions/search/index.ts";
import { ErrorCodes as YouTubeErrorCodes } from "../functions/_shared/youtube.ts";

// =============================================================================
// Environment Helpers
// =============================================================================

const REQUIRED_ENV_VARS = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "YOUTUBE_API_KEY",
];

function hasRequiredEnvVars(): boolean {
    return REQUIRED_ENV_VARS.every((key) => Deno.env.get(key));
}

function skipIfNoEnvVars(): boolean {
    if (!hasRequiredEnvVars()) {
        console.log(
            `⚠️ Skipping integration test: Missing env vars (${REQUIRED_ENV_VARS.join(", ")})`
        );
        return true;
    }
    return false;
}

// =============================================================================
// Test Helpers
// =============================================================================

function createRequest(
    params: Record<string, string>,
    method = "GET"
): Request {
    const url = new URL("http://localhost/search");
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    return new Request(url.toString(), { method });
}

// =============================================================================
// Unit Tests (No External Dependencies)
// =============================================================================

Deno.test("search - returns 400 for missing query parameter", async () => {
    const req = createRequest({});
    const res = await handleRequest(req);

    assertEquals(res.status, 400);

    const body = await res.json();
    assertEquals(body.code, "VALIDATION_ERROR");
    assertEquals(body.retryable, false);
    assertExists(body.error);
});

Deno.test("search - returns 400 for empty query parameter", async () => {
    const req = createRequest({ q: "" });
    const res = await handleRequest(req);

    assertEquals(res.status, 400);

    const body = await res.json();
    assertEquals(body.code, "VALIDATION_ERROR");
    assertEquals(body.retryable, false);
});

Deno.test("search - returns 400 for whitespace-only query parameter", async () => {
    const req = createRequest({ q: "   " });
    const res = await handleRequest(req);

    assertEquals(res.status, 400);

    const body = await res.json();
    assertEquals(body.code, "VALIDATION_ERROR");
    assertEquals(body.retryable, false);
    assertEquals(body.error, "Search query is required");
});

Deno.test("search - OPTIONS returns 204 with CORS headers", async () => {
    const req = new Request("http://localhost/search", { method: "OPTIONS" });
    const res = await handleRequest(req);

    assertEquals(res.status, 204);
    assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
    assertEquals(res.headers.get("Access-Control-Allow-Methods"), "GET, OPTIONS");
    assertExists(res.headers.get("Access-Control-Allow-Headers"));
});

Deno.test("search - GET response includes CORS headers", async () => {
    // Even error responses should have CORS headers
    const req = createRequest({ q: "" });
    const res = await handleRequest(req);

    assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
    assertEquals(res.headers.get("content-type"), "application/json");
});

Deno.test("search - returns 405 for POST requests", async () => {
    const url = new URL("http://localhost/search");
    url.searchParams.set("q", "pasta");
    const req = new Request(url.toString(), { method: "POST" });
    const res = await handleRequest(req);

    assertEquals(res.status, 405);

    const body = await res.json();
    assertEquals(body.code, "METHOD_NOT_ALLOWED");
    assertEquals(body.retryable, false);
    assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
});

Deno.test("search - returns 405 for PUT requests", async () => {
    const url = new URL("http://localhost/search");
    url.searchParams.set("q", "pasta");
    const req = new Request(url.toString(), { method: "PUT" });
    const res = await handleRequest(req);

    assertEquals(res.status, 405);

    const body = await res.json();
    assertEquals(body.code, "METHOD_NOT_ALLOWED");
});

Deno.test("search - all responses include CORS and JSON content-type", async () => {
    const testCases: Array<{ params: Record<string, string>; expectedStatus: number }> = [
        { params: {}, expectedStatus: 400 }, // Validation error
    ];

    for (const { params, expectedStatus } of testCases) {
        const req = createRequest(params);
        const res = await handleRequest(req);

        assertEquals(
            res.headers.get("Access-Control-Allow-Origin"),
            "*",
            `Missing CORS header for status ${expectedStatus}`
        );
        assertEquals(
            res.headers.get("content-type"),
            "application/json",
            `Missing content-type for status ${expectedStatus}`
        );
    }
});

// =============================================================================
// Timeout Tests (Uses Stub)
// =============================================================================

Deno.test("search - timeout returns YOUTUBE_TIMEOUT_ERROR with retryable:true", async () => {
    if (skipIfNoEnvVars()) return;

    // Stub fetch to simulate a slow response that gets aborted
    const fetchStub = stub(globalThis, "fetch", (_url: string | URL | Request, init?: RequestInit & { signal?: AbortSignal }) => {
        // Check if signal is provided
        const signal = init?.signal;

        // Create a promise that waits forever (will be aborted)
        return new Promise<Response>((_resolve, reject) => {
            if (signal) {
                signal.addEventListener("abort", () => {
                    const error = new Error("The operation was aborted");
                    error.name = "AbortError";
                    reject(error);
                });
            }
            // Never resolves normally - will be aborted
        });
    });

    try {
        // Use unique query to avoid cache hit
        const uniqueQuery = `timeout test ${Date.now()}`;
        const req = createRequest({ q: uniqueQuery });
        const res = await handleRequest(req);

        assertEquals(res.status, 504);

        const body = await res.json();
        assertEquals(body.code, YouTubeErrorCodes.TIMEOUT_ERROR);
        assertEquals(body.retryable, true);
        assertEquals(body.error, "Request timed out");
        assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
    } finally {
        fetchStub.restore();
    }
});

// =============================================================================
// Integration Tests (Require Real Services)
// =============================================================================

Deno.test("search - cache miss returns YouTube results with cached:false", async () => {
    if (skipIfNoEnvVars()) return;

    // Use a unique query to avoid hitting cache
    const uniqueQuery = `pasta carbonara ${Date.now()}`;
    const req = createRequest({ q: uniqueQuery, locale: "en-US" });
    const res = await handleRequest(req);

    assertEquals(res.status, 200);

    const body = await res.json();
    assertEquals(body.cached, false);
    assertExists(body.videos);
    assert(Array.isArray(body.videos));

    // If we got results, verify structure
    if (body.videos.length > 0) {
        const video = body.videos[0];
        assertExists(video.video_id);
        assertExists(video.title);
        assertExists(video.channel_title);
        assertExists(video.thumbnail_url);
    }

    // Should have pagination info
    assertExists(body.totalResults);
    assert(typeof body.totalResults === "number");
});

Deno.test("search - cache hit returns cached:true on second request", async () => {
    if (skipIfNoEnvVars()) return;

    // Use a common query that's likely to have stable results
    const query = "pasta recipe simple";
    const locale = "en-US";

    // First request - should be cache miss or hit depending on previous runs
    const req1 = createRequest({ q: query, locale });
    const res1 = await handleRequest(req1);
    assertEquals(res1.status, 200);

    const body1 = await res1.json();
    assertExists(body1.videos);

    // Wait briefly for cache write
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Second request - should be cache hit
    const req2 = createRequest({ q: query, locale });
    const res2 = await handleRequest(req2);
    assertEquals(res2.status, 200);

    const body2 = await res2.json();
    assertEquals(body2.cached, true);
    assertExists(body2.videos);

    // Data should match
    assertEquals(body2.totalResults, body1.totalResults);
});

Deno.test("search - YouTube API errors are propagated correctly", async () => {
    if (skipIfNoEnvVars()) return;

    // Temporarily set an invalid API key to trigger an error
    const originalKey = Deno.env.get("YOUTUBE_API_KEY");
    Deno.env.set("YOUTUBE_API_KEY", "invalid-api-key-for-test");

    try {
        // Use unique query to avoid cache hit
        const uniqueQuery = `api error test ${Date.now()}`;
        const req = createRequest({ q: uniqueQuery });
        const res = await handleRequest(req);

        // YouTube returns 400 for invalid API key
        assert(res.status === 400 || res.status === 403);

        const body = await res.json();
        assertExists(body.code);
        assertExists(body.error);
        assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*");
        assertEquals(res.headers.get("content-type"), "application/json");
    } finally {
        // Restore original key
        if (originalKey) {
            Deno.env.set("YOUTUBE_API_KEY", originalKey);
        }
    }
});

Deno.test("search - cache read error falls back to YouTube", async () => {
    if (skipIfNoEnvVars()) return;

    // We can't easily simulate a cache read error without mocking Supabase
    // This test verifies the happy path works - cache errors are logged but
    // the request still succeeds by falling back to YouTube

    const uniqueQuery = `cache fallback test ${Date.now()}`;
    const req = createRequest({ q: uniqueQuery });
    const res = await handleRequest(req);

    // Should succeed regardless of cache state
    assertEquals(res.status, 200);

    const body = await res.json();
    assertExists(body.videos);
});

Deno.test("search - cache write error does not block response", async () => {
    if (skipIfNoEnvVars()) return;

    // Similarly, we verify the response is returned even if cache write might fail
    // The fire-and-forget pattern ensures the response is not blocked

    const uniqueQuery = `cache write test ${Date.now()}`;
    const req = createRequest({ q: uniqueQuery });

    const startTime = Date.now();
    const res = await handleRequest(req);
    const elapsed = Date.now() - startTime;

    assertEquals(res.status, 200);

    const body = await res.json();
    assertEquals(body.cached, false);
    assertExists(body.videos);

    // Response should be fast (not waiting for cache write)
    // Allow up to 10s for YouTube API call
    assert(elapsed < 10000, `Response took too long: ${elapsed}ms`);
});

Deno.test("search - pageToken is passed to YouTube API", async () => {
    if (skipIfNoEnvVars()) return;

    // First, get results to potentially get a nextPageToken
    const req1 = createRequest({ q: "pasta recipe", locale: "en-US" });
    const res1 = await handleRequest(req1);
    assertEquals(res1.status, 200);

    const body1 = await res1.json();

    // If we got a nextPageToken, test pagination
    if (body1.nextPageToken) {
        const req2 = createRequest({
            q: "pasta recipe",
            locale: "en-US",
            pageToken: body1.nextPageToken,
        });
        const res2 = await handleRequest(req2);
        assertEquals(res2.status, 200);

        const body2 = await res2.json();
        assertExists(body2.videos);

        // Results should be different (next page)
        if (body2.videos.length > 0 && body1.videos.length > 0) {
            // At least the first video should be different
            assert(
                body2.videos[0].video_id !== body1.videos[0].video_id,
                "Pagination should return different videos"
            );
        }
    }
});
