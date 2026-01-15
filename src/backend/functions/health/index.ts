import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { captureError, initSentry } from "../_shared/sentry.ts";

initSentry();

serve(async (_req) => {
    try {
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        await captureError(error, { surface: "edge", feature: "health", flow: "health" });
        return new Response(JSON.stringify({ ok: false }), {
            status: 500,
            headers: { "content-type": "application/json" },
        });
    }
});
