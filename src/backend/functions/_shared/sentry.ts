import * as Sentry from "https://deno.land/x/sentry/index.mjs";

type SentryTags = Record<string, string>;

let initialized = false;

export function initSentry() {
    if (initialized) return;

    const dsn = Deno.env.get("SENTRY_DSN_EDGE") ?? "";
    if (!dsn) return;

    const tracesSampleRateRaw = Deno.env.get("SENTRY_TRACES_SAMPLE_RATE");
    const tracesSampleRate = tracesSampleRateRaw
        ? Number.parseFloat(tracesSampleRateRaw)
        : undefined;

    Sentry.init({
        dsn,
        environment: Deno.env.get("SENTRY_ENV") ?? "local",
        release: Deno.env.get("SENTRY_RELEASE"),
        sendDefaultPii: false,
        tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : undefined,
        // Deno.serve is not auto-instrumented; keep integrations minimal.
        defaultIntegrations: false,
    });

    initialized = true;
}

export async function captureError(error: unknown, tags?: SentryTags) {
    if (!initialized) return;

    Sentry.withScope((scope) => {
        if (tags) scope.setTags(tags);
        Sentry.captureException(error);
    });

    // Flush quickly so serverless functions don't drop the event.
    await Sentry.flush(2000);
}
