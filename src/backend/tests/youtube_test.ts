import {
    assertEquals,
    assertRejects,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
    assertSpyCalls,
    stub,
} from "https://deno.land/std@0.224.0/testing/mock.ts";

// Import from the module under test
import {
    augmentQuery,
    buildSearchURL,
    clampMaxResults,
    parseRegionFromLocale,
    transformResponse,
    searchYouTube,
    YouTubeAPIError,
    ErrorCodes,
} from "../functions/_shared/youtube.ts";

// ============================================================================
// augmentQuery tests
// ============================================================================

Deno.test("augmentQuery - adds bias terms to plain query", () => {
    const result = augmentQuery("pasta");
    assertEquals(result, "pasta recipe OR cooking");
});

Deno.test("augmentQuery - skips augmentation if already has 'recipe'", () => {
    const result = augmentQuery("pasta recipe");
    assertEquals(result, "pasta recipe");
});

Deno.test("augmentQuery - skips augmentation if already has 'cooking'", () => {
    const result = augmentQuery("pasta cooking");
    assertEquals(result, "pasta cooking");
});

Deno.test("augmentQuery - case insensitive check for existing terms", () => {
    const result1 = augmentQuery("PASTA RECIPE");
    assertEquals(result1, "PASTA RECIPE");

    const result2 = augmentQuery("Cooking with Jamie");
    assertEquals(result2, "Cooking with Jamie");
});

Deno.test("augmentQuery - trims whitespace", () => {
    const result = augmentQuery("  pasta  ");
    assertEquals(result, "pasta recipe OR cooking");
});

// ============================================================================
// clampMaxResults tests
// ============================================================================

Deno.test("clampMaxResults - returns default for undefined", () => {
    const result = clampMaxResults(undefined);
    assertEquals(result, 20);
});

Deno.test("clampMaxResults - clamps to max 50", () => {
    const result = clampMaxResults(100);
    assertEquals(result, 50);
});

Deno.test("clampMaxResults - clamps to min 1", () => {
    const result = clampMaxResults(0);
    assertEquals(result, 1);

    const result2 = clampMaxResults(-5);
    assertEquals(result2, 1);
});

Deno.test("clampMaxResults - returns valid values unchanged", () => {
    assertEquals(clampMaxResults(10), 10);
    assertEquals(clampMaxResults(50), 50);
    assertEquals(clampMaxResults(1), 1);
});

// ============================================================================
// parseRegionFromLocale tests
// ============================================================================

Deno.test("parseRegionFromLocale - returns null for simple language code", () => {
    const result = parseRegionFromLocale("it");
    assertEquals(result, null);
});

Deno.test("parseRegionFromLocale - extracts region from language-region format", () => {
    const result = parseRegionFromLocale("en-US");
    assertEquals(result, "US");
});

Deno.test("parseRegionFromLocale - parses with underscore separator", () => {
    const result = parseRegionFromLocale("pt_BR");
    assertEquals(result, "BR");
});

Deno.test("parseRegionFromLocale - extracts region from language-script-region format", () => {
    const result = parseRegionFromLocale("zh-Hans-CN");
    assertEquals(result, "CN");
});

Deno.test("parseRegionFromLocale - handles lowercase region", () => {
    const result = parseRegionFromLocale("en-us");
    assertEquals(result, "US");
});

Deno.test("parseRegionFromLocale - returns null for language-only code", () => {
    const result = parseRegionFromLocale("en");
    assertEquals(result, null);
});

// ============================================================================
// buildSearchURL tests
// ============================================================================

Deno.test("buildSearchURL - includes all required params", () => {
    const url = buildSearchURL({ query: "pasta" }, "test-api-key");
    const parsed = new URL(url);

    assertEquals(parsed.searchParams.get("key"), "test-api-key");
    assertEquals(parsed.searchParams.get("part"), "snippet");
    assertEquals(parsed.searchParams.get("type"), "video");
    assertEquals(parsed.searchParams.get("videoCategoryId"), "26");
    assertEquals(parsed.searchParams.get("safeSearch"), "strict");
    assertEquals(parsed.searchParams.get("videoEmbeddable"), "true");
    assertEquals(parsed.searchParams.get("videoSyndicated"), "true");
    assertEquals(parsed.searchParams.get("relevanceLanguage"), "en");
    assertEquals(parsed.searchParams.get("maxResults"), "20");
    // Query should be augmented
    assertEquals(parsed.searchParams.get("q"), "pasta recipe OR cooking");
});

Deno.test("buildSearchURL - does not set regionCode for simple locale", () => {
    const url = buildSearchURL({ query: "pasta", locale: "it" }, "test-api-key");
    const parsed = new URL(url);

    // No regionCode because "it" has no explicit country
    assertEquals(parsed.searchParams.get("regionCode"), null);
    // relevanceLanguage is always "en"
    assertEquals(parsed.searchParams.get("relevanceLanguage"), "en");
});

Deno.test("buildSearchURL - sets regionCode for BCP-47 locale with country", () => {
    const url = buildSearchURL({ query: "pasta", locale: "en-US" }, "test-api-key");
    const parsed = new URL(url);

    assertEquals(parsed.searchParams.get("regionCode"), "US");
    // relevanceLanguage is always "en"
    assertEquals(parsed.searchParams.get("relevanceLanguage"), "en");
});

Deno.test("buildSearchURL - includes pageToken when provided", () => {
    const url = buildSearchURL({ query: "pasta", pageToken: "NEXT_PAGE_TOKEN" }, "test-api-key");
    const parsed = new URL(url);

    assertEquals(parsed.searchParams.get("pageToken"), "NEXT_PAGE_TOKEN");
});

Deno.test("buildSearchURL - clamps maxResults", () => {
    const url = buildSearchURL({ query: "pasta", maxResults: 100 }, "test-api-key");
    const parsed = new URL(url);

    assertEquals(parsed.searchParams.get("maxResults"), "50");
});

// ============================================================================
// transformResponse tests
// ============================================================================

Deno.test("transformResponse - extracts video fields correctly", () => {
    const mockResponse = {
        kind: "youtube#searchListResponse",
        nextPageToken: "NEXT_TOKEN",
        pageInfo: {
            totalResults: 100,
            resultsPerPage: 2,
        },
        items: [
            {
                id: { videoId: "abc123" },
                snippet: {
                    title: "Test Video 1",
                    channelTitle: "Test Channel",
                    thumbnails: {
                        high: { url: "https://example.com/high.jpg" },
                        medium: { url: "https://example.com/medium.jpg" },
                        default: { url: "https://example.com/default.jpg" },
                    },
                },
            },
            {
                id: { videoId: "def456" },
                snippet: {
                    title: "Test Video 2",
                    channelTitle: "Another Channel",
                    thumbnails: {
                        medium: { url: "https://example.com/medium2.jpg" },
                        default: { url: "https://example.com/default2.jpg" },
                    },
                },
            },
        ],
    };

    const result = transformResponse(mockResponse);

    assertEquals(result.videos.length, 2);
    assertEquals(result.nextPageToken, "NEXT_TOKEN");
    assertEquals(result.totalResults, 100);

    assertEquals(result.videos[0], {
        video_id: "abc123",
        title: "Test Video 1",
        channel_title: "Test Channel",
        thumbnail_url: "https://example.com/high.jpg",
    });

    // Should fall back to medium when high is missing
    assertEquals(result.videos[1].thumbnail_url, "https://example.com/medium2.jpg");
});

Deno.test("transformResponse - filters out items without videoId", () => {
    const mockResponse = {
        kind: "youtube#searchListResponse",
        pageInfo: { totalResults: 2, resultsPerPage: 2 },
        items: [
            {
                id: { videoId: "abc123" },
                snippet: {
                    title: "Valid Video",
                    channelTitle: "Channel",
                    thumbnails: { default: { url: "https://example.com/thumb.jpg" } },
                },
            },
            {
                id: {}, // No videoId (e.g., a channel result)
                snippet: {
                    title: "Invalid Item",
                    channelTitle: "Channel",
                    thumbnails: { default: { url: "https://example.com/thumb2.jpg" } },
                },
            },
        ],
    };

    const result = transformResponse(mockResponse);
    assertEquals(result.videos.length, 1);
    assertEquals(result.videos[0].video_id, "abc123");
});

Deno.test("transformResponse - handles missing nextPageToken", () => {
    const mockResponse = {
        kind: "youtube#searchListResponse",
        pageInfo: { totalResults: 1, resultsPerPage: 1 },
        items: [],
    };

    const result = transformResponse(mockResponse);
    assertEquals(result.nextPageToken, null);
});

// ============================================================================
// YouTubeAPIError tests
// ============================================================================

Deno.test("YouTubeAPIError - toJSON returns correct format", () => {
    const error = new YouTubeAPIError(
        "Quota exceeded",
        ErrorCodes.QUOTA_EXCEEDED,
        false,
        403
    );

    const json = error.toJSON();
    assertEquals(json, {
        error: "Quota exceeded",
        code: "YOUTUBE_QUOTA_EXCEEDED",
        retryable: false,
    });
});

// ============================================================================
// searchYouTube integration tests (with mocked fetch)
// ============================================================================

Deno.test("searchYouTube - throws when API key is missing", async () => {
    // Temporarily remove API key
    const originalKey = Deno.env.get("YOUTUBE_API_KEY");
    Deno.env.delete("YOUTUBE_API_KEY");

    try {
        await assertRejects(
            () => searchYouTube({ query: "pasta" }),
            YouTubeAPIError,
            "YouTube API key not configured"
        );
    } finally {
        // Restore API key if it existed
        if (originalKey) {
            Deno.env.set("YOUTUBE_API_KEY", originalKey);
        }
    }
});

Deno.test("searchYouTube - throws for empty query", async () => {
    Deno.env.set("YOUTUBE_API_KEY", "test-key");

    try {
        await assertRejects(
            () => searchYouTube({ query: "" }),
            YouTubeAPIError,
            "Search query is required"
        );

        await assertRejects(
            () => searchYouTube({ query: "   " }),
            YouTubeAPIError,
            "Search query is required"
        );
    } finally {
        Deno.env.delete("YOUTUBE_API_KEY");
    }
});

Deno.test("searchYouTube - handles 400 Bad Request", async () => {
    Deno.env.set("YOUTUBE_API_KEY", "test-key");

    const fetchStub = stub(globalThis, "fetch", () =>
        Promise.resolve(
            new Response(
                JSON.stringify({
                    error: {
                        message: "Invalid parameter",
                        errors: [{ reason: "invalidParameter" }],
                    },
                }),
                { status: 400 }
            )
        )
    );

    try {
        const error = await assertRejects(
            () => searchYouTube({ query: "pasta" }),
            YouTubeAPIError
        );
        assertEquals((error as YouTubeAPIError).code, ErrorCodes.INVALID_REQUEST);
        assertEquals((error as YouTubeAPIError).retryable, false);
    } finally {
        fetchStub.restore();
        Deno.env.delete("YOUTUBE_API_KEY");
    }
});

Deno.test("searchYouTube - handles 403 quota exceeded", async () => {
    Deno.env.set("YOUTUBE_API_KEY", "test-key");

    const fetchStub = stub(globalThis, "fetch", () =>
        Promise.resolve(
            new Response(
                JSON.stringify({
                    error: {
                        message: "Quota exceeded",
                        errors: [{ reason: "quotaExceeded" }],
                    },
                }),
                { status: 403 }
            )
        )
    );

    try {
        const error = await assertRejects(
            () => searchYouTube({ query: "pasta" }),
            YouTubeAPIError
        );
        assertEquals((error as YouTubeAPIError).code, ErrorCodes.QUOTA_EXCEEDED);
        assertEquals((error as YouTubeAPIError).retryable, false);
    } finally {
        fetchStub.restore();
        Deno.env.delete("YOUTUBE_API_KEY");
    }
});

Deno.test("searchYouTube - handles 429 rate limited", async () => {
    Deno.env.set("YOUTUBE_API_KEY", "test-key");

    const fetchStub = stub(globalThis, "fetch", () =>
        Promise.resolve(
            new Response(
                JSON.stringify({ error: { message: "Too many requests" } }),
                { status: 429 }
            )
        )
    );

    try {
        const error = await assertRejects(
            () => searchYouTube({ query: "pasta" }),
            YouTubeAPIError
        );
        assertEquals((error as YouTubeAPIError).code, ErrorCodes.RATE_LIMITED);
        assertEquals((error as YouTubeAPIError).retryable, true);
    } finally {
        fetchStub.restore();
        Deno.env.delete("YOUTUBE_API_KEY");
    }
});

Deno.test("searchYouTube - handles network errors", async () => {
    Deno.env.set("YOUTUBE_API_KEY", "test-key");

    const fetchStub = stub(globalThis, "fetch", () =>
        Promise.reject(new Error("Network failure"))
    );

    try {
        const error = await assertRejects(
            () => searchYouTube({ query: "pasta" }),
            YouTubeAPIError
        );
        assertEquals((error as YouTubeAPIError).code, ErrorCodes.NETWORK_ERROR);
        assertEquals((error as YouTubeAPIError).retryable, true);
    } finally {
        fetchStub.restore();
        Deno.env.delete("YOUTUBE_API_KEY");
    }
});

Deno.test("searchYouTube - returns transformed results on success", async () => {
    Deno.env.set("YOUTUBE_API_KEY", "test-key");

    const mockYouTubeResponse = {
        kind: "youtube#searchListResponse",
        nextPageToken: "TOKEN123",
        pageInfo: { totalResults: 500, resultsPerPage: 20 },
        items: [
            {
                id: { videoId: "video1" },
                snippet: {
                    title: "Pasta Carbonara Recipe",
                    channelTitle: "Italian Chef",
                    thumbnails: {
                        high: { url: "https://i.ytimg.com/vi/video1/hqdefault.jpg" },
                    },
                },
            },
        ],
    };

    const fetchStub = stub(globalThis, "fetch", () =>
        Promise.resolve(
            new Response(JSON.stringify(mockYouTubeResponse), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        )
    );

    try {
        const result = await searchYouTube({ query: "pasta carbonara" });

        assertEquals(result.videos.length, 1);
        assertEquals(result.videos[0].video_id, "video1");
        assertEquals(result.videos[0].title, "Pasta Carbonara Recipe");
        assertEquals(result.videos[0].channel_title, "Italian Chef");
        assertEquals(result.nextPageToken, "TOKEN123");
        assertEquals(result.totalResults, 500);

        // Verify fetch was called with correct URL params
        assertSpyCalls(fetchStub, 1);
        const fetchUrl = new URL(fetchStub.calls[0].args[0] as string);
        assertEquals(fetchUrl.searchParams.get("videoCategoryId"), "26");
        assertEquals(fetchUrl.searchParams.get("safeSearch"), "strict");
        assertEquals(fetchUrl.searchParams.get("videoEmbeddable"), "true");
        assertEquals(fetchUrl.searchParams.get("videoSyndicated"), "true");
        assertEquals(fetchUrl.searchParams.get("relevanceLanguage"), "en");
    } finally {
        fetchStub.restore();
        Deno.env.delete("YOUTUBE_API_KEY");
    }
});
