import {
    assertEquals,
    assertRejects,
    assertNotEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

import {
    normalizeQueryKey,
    createCacheClient,
    getCachedResults,
    setCachedResults,
    deleteCachedResult,
    CacheError,
    ErrorCodes,
    CachedSearchResults,
} from "../functions/_shared/cache.ts";

// ============================================================================
// Mock Supabase Client Factory
// ============================================================================

interface MockSupabaseConfig {
    selectResult?: { data: unknown; error: unknown };
    upsertError?: unknown;
    deleteError?: unknown;
}

function createMockClient(config: MockSupabaseConfig = {}): SupabaseClient {
    return {
        from: () => ({
            select: () => ({
                eq: () => ({
                    gt: () => ({
                        maybeSingle: () =>
                            Promise.resolve(
                                config.selectResult ?? { data: null, error: null }
                            ),
                    }),
                }),
            }),
            upsert: () => Promise.resolve({ error: config.upsertError ?? null }),
            delete: () => ({
                eq: () => Promise.resolve({ error: config.deleteError ?? null }),
            }),
        }),
    } as unknown as SupabaseClient;
}

// ============================================================================
// normalizeQueryKey tests
// ============================================================================

Deno.test("normalizeQueryKey - lowercases, trims, collapses whitespace", async () => {
    const result = await normalizeQueryKey("  PASTA   Carbonara  ");
    const expected = await normalizeQueryKey("pasta carbonara");
    assertEquals(result, expected);
});

Deno.test("normalizeQueryKey - same inputs produce same hash (deterministic)", async () => {
    const result1 = await normalizeQueryKey("pasta", "en-US");
    const result2 = await normalizeQueryKey("pasta", "en-US");
    assertEquals(result1, result2);
});

Deno.test("normalizeQueryKey - different pageToken produces different hash", async () => {
    const withoutToken = await normalizeQueryKey("pasta", "en-US", undefined);
    const withToken = await normalizeQueryKey("pasta", "en-US", "CAEQAA");
    assertNotEquals(withoutToken, withToken);
});

Deno.test("normalizeQueryKey - handles undefined locale and pageToken", async () => {
    const result = await normalizeQueryKey("pasta");
    // Should not throw and should return a valid hash
    assertEquals(result.length, 64); // SHA-256 = 64 hex chars
});

Deno.test("normalizeQueryKey - handles empty locale and pageToken", async () => {
    const withUndefined = await normalizeQueryKey("pasta", undefined, undefined);
    const withEmpty = await normalizeQueryKey("pasta", "", "");
    assertEquals(withUndefined, withEmpty);
});

Deno.test("normalizeQueryKey - returns 64-character hex string (SHA-256)", async () => {
    const result = await normalizeQueryKey("any query");
    assertEquals(result.length, 64);
    // Verify it's all hex characters
    assertEquals(/^[a-f0-9]{64}$/.test(result), true);
});

Deno.test("normalizeQueryKey - locale is case-insensitive", async () => {
    const lower = await normalizeQueryKey("pasta", "en-us");
    const upper = await normalizeQueryKey("pasta", "EN-US");
    assertEquals(lower, upper);
});

Deno.test("normalizeQueryKey - different queries produce different hashes", async () => {
    const pasta = await normalizeQueryKey("pasta");
    const pizza = await normalizeQueryKey("pizza");
    assertNotEquals(pasta, pizza);
});

// ============================================================================
// createCacheClient tests
// ============================================================================

Deno.test("createCacheClient - throws CLIENT_ERROR when URL missing", () => {
    // Use injected options with undefined URL
    try {
        createCacheClient({
            supabaseUrl: undefined,
            supabaseServiceKey: "test-key",
        });
        throw new Error("Should have thrown");
    } catch (err) {
        assertEquals((err as CacheError).code, ErrorCodes.CLIENT_ERROR);
        assertEquals((err as CacheError).retryable, false);
        assertEquals(
            (err as CacheError).message,
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
        );
    }
});

Deno.test("createCacheClient - throws CLIENT_ERROR when key missing", () => {
    // Use injected options with undefined key
    try {
        createCacheClient({
            supabaseUrl: "https://test.supabase.co",
            supabaseServiceKey: undefined,
        });
        throw new Error("Should have thrown");
    } catch (err) {
        assertEquals((err as CacheError).code, ErrorCodes.CLIENT_ERROR);
        assertEquals((err as CacheError).retryable, false);
    }
});

Deno.test("createCacheClient - throws CLIENT_ERROR when both missing", () => {
    try {
        createCacheClient({
            supabaseUrl: undefined,
            supabaseServiceKey: undefined,
        });
        throw new Error("Should have thrown");
    } catch (err) {
        assertEquals((err as CacheError).code, ErrorCodes.CLIENT_ERROR);
        assertEquals((err as CacheError).retryable, false);
    }
});

Deno.test("createCacheClient - uses injected options for tests", () => {
    let capturedUrl: string | undefined;
    let capturedKey: string | undefined;

    const mockCreateClient = (url: string, key: string) => {
        capturedUrl = url;
        capturedKey = key;
        return {} as SupabaseClient;
    };

    createCacheClient({
        supabaseUrl: "https://custom.supabase.co",
        supabaseServiceKey: "custom-key",
        createClientFn: mockCreateClient as typeof import("jsr:@supabase/supabase-js@2").createClient,
    });

    assertEquals(capturedUrl, "https://custom.supabase.co");
    assertEquals(capturedKey, "custom-key");
});

// ============================================================================
// getCachedResults tests
// ============================================================================

Deno.test("getCachedResults - returns { cached: false } on miss", async () => {
    const mockClient = createMockClient({
        selectResult: { data: null, error: null },
    });

    const result = await getCachedResults(mockClient, "nonexistent-key");
    assertEquals(result.cached, false);
    assertEquals(result.data, null);
});

Deno.test("getCachedResults - returns { cached: true, data } on hit", async () => {
    const cachedData: CachedSearchResults = {
        videos: [
            {
                video_id: "abc123",
                title: "Test Video",
                channel_title: "Test Channel",
                thumbnail_url: "https://example.com/thumb.jpg",
            },
        ],
        nextPageToken: "TOKEN",
        totalResults: 100,
    };

    const mockClient = createMockClient({
        selectResult: {
            data: {
                results_json: cachedData,
                expires_at: new Date(Date.now() + 86400000).toISOString(),
            },
            error: null,
        },
    });

    const result = await getCachedResults(mockClient, "valid-key");
    assertEquals(result.cached, true);
    assertEquals(result.data, cachedData);
});

Deno.test("getCachedResults - throws DATABASE_ERROR on query failure", async () => {
    const mockClient = createMockClient({
        selectResult: { data: null, error: { message: "Connection failed" } },
    });

    await assertRejects(
        () => getCachedResults(mockClient, "any-key"),
        CacheError,
        "Database error: Connection failed"
    );
});

Deno.test("getCachedResults - deletes and returns miss for invalid cached JSON", async () => {
    let deleteWasCalled = false;

    const mockClient = {
        from: () => ({
            select: () => ({
                eq: () => ({
                    gt: () => ({
                        maybeSingle: () =>
                            Promise.resolve({
                                data: {
                                    results_json: { invalid: "structure" },
                                    expires_at: new Date(Date.now() + 86400000).toISOString(),
                                },
                                error: null,
                            }),
                    }),
                }),
            }),
            delete: () => ({
                eq: () => {
                    deleteWasCalled = true;
                    return Promise.resolve({ error: null });
                },
            }),
        }),
    } as unknown as SupabaseClient;

    const result = await getCachedResults(mockClient, "corrupted-key");
    assertEquals(result.cached, false);
    assertEquals(result.data, null);
    assertEquals(deleteWasCalled, true);
});

// ============================================================================
// setCachedResults tests
// ============================================================================

Deno.test("setCachedResults - upserts with expires_at = now + 24h", async () => {
    let capturedData: Record<string, unknown> | undefined;
    let capturedOptions: Record<string, unknown> | undefined;

    const mockClient = {
        from: () => ({
            upsert: (data: Record<string, unknown>, options: Record<string, unknown>) => {
                capturedData = data;
                capturedOptions = options;
                return Promise.resolve({ error: null });
            },
        }),
    } as unknown as SupabaseClient;

    const results: CachedSearchResults = {
        videos: [],
        nextPageToken: null,
        totalResults: 0,
    };

    const beforeCall = Date.now();
    await setCachedResults(mockClient, "test-key", results);
    const afterCall = Date.now();

    assertEquals(capturedData?.query_key, "test-key");
    assertEquals(capturedData?.results_json, results);
    assertEquals(capturedOptions?.onConflict, "query_key");

    // Verify expires_at is roughly 24 hours from now
    const expiresAt = new Date(capturedData?.expires_at as string).getTime();
    const expectedMin = beforeCall + 24 * 60 * 60 * 1000 - 1000;
    const expectedMax = afterCall + 24 * 60 * 60 * 1000 + 1000;
    assertEquals(expiresAt >= expectedMin && expiresAt <= expectedMax, true);

    // Verify created_at is NOT included (should not overwrite on upsert)
    assertEquals(capturedData?.created_at, undefined);
});

Deno.test("setCachedResults - throws DATABASE_ERROR on upsert failure", async () => {
    const mockClient = createMockClient({
        upsertError: { message: "Write failed" },
    });

    const results: CachedSearchResults = {
        videos: [],
        nextPageToken: null,
        totalResults: 0,
    };

    await assertRejects(
        () => setCachedResults(mockClient, "test-key", results),
        CacheError,
        "Database error: Write failed"
    );
});

// ============================================================================
// deleteCachedResult tests
// ============================================================================

Deno.test("deleteCachedResult - calls delete with correct key", async () => {
    let capturedKey: string | undefined;

    const mockClient = {
        from: () => ({
            delete: () => ({
                eq: (_col: string, key: string) => {
                    capturedKey = key;
                    return Promise.resolve({ error: null });
                },
            }),
        }),
    } as unknown as SupabaseClient;

    await deleteCachedResult(mockClient, "delete-me");
    assertEquals(capturedKey, "delete-me");
});

Deno.test("deleteCachedResult - calls onError callback on failure", async () => {
    let errorWasCaptured = false;
    let capturedError: Error | undefined;
    let capturedContext: Record<string, string> | undefined;

    const mockClient = createMockClient({
        deleteError: { message: "Delete failed" },
    });

    await deleteCachedResult(mockClient, "failing-key", {
        onError: async (err, ctx) => {
            errorWasCaptured = true;
            capturedError = err;
            capturedContext = ctx;
        },
    });

    assertEquals(errorWasCaptured, true);
    assertEquals(capturedError?.message, "Failed to delete cache entry: Delete failed");
    assertEquals(capturedContext?.queryKey, "failing-key");
    assertEquals(capturedContext?.operation, "cache_delete");
});

Deno.test("deleteCachedResult - does not throw on error (fire-and-forget)", async () => {
    const mockClient = createMockClient({
        deleteError: { message: "Delete failed" },
    });

    // Should not throw, even with no onError handler
    // Note: In production this would call captureError, but we're testing that it doesn't throw
    await deleteCachedResult(mockClient, "failing-key", {
        onError: async () => {
            // No-op handler to avoid calling real captureError
        },
    });

    // If we reach here without throwing, the test passes
    assertEquals(true, true);
});

// ============================================================================
// CacheError tests
// ============================================================================

Deno.test("CacheError - toJSON returns correct format", () => {
    const error = new CacheError(
        "Database connection failed",
        ErrorCodes.DATABASE_ERROR,
        true
    );

    const json = error.toJSON();
    assertEquals(json, {
        error: "Database connection failed",
        code: "CACHE_DATABASE_ERROR",
        retryable: true,
    });
});

Deno.test("CacheError - has correct name property", () => {
    const error = new CacheError("Test error", ErrorCodes.CLIENT_ERROR, false);
    assertEquals(error.name, "CacheError");
});

Deno.test("CacheError - non-retryable error", () => {
    const error = new CacheError("Invalid data", ErrorCodes.INVALID_DATA, false);
    assertEquals(error.retryable, false);
    assertEquals(error.code, "CACHE_INVALID_DATA");
});
