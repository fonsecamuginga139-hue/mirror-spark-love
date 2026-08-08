// Hotmart webhook (production-hardened)
// - Validates HOTTOK (header or body)
// - Idempotent via the stored event id in payment_events
// - Maps events to profile subscription state
// - Returns 5xx on transient errors so Hotmart retries automatically
// - Structured logging on every path
import { createFileRoute } from "@tanstack/react-router";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hotmart-hottok",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type State = {
  plan_status: "active" | "expired" | "trial_active";
  plano: "monthly" | "master" | "free";
  status_assinatura: "ativo" | "inativo";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload = any;

// Map Hotmart events → profile state. Return null for unknown / informational events.
function resolveState(event: string, payload: Payload): State | null {
  const e = (event || "").toUpperCase();

  // Activations
  if (["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "SUBSCRIPTION_CREATED"].includes(e)) {
    const recurrence =
      payload?.data?.subscription?.plan?.name || payload?.data?.plan?.name || "";
    const isAnnual = /anual|annual|year|master/i.test(String(recurrence));
    return {
      plan_status: "active",
      plano: isAnnual ? "master" : "monthly",
      status_assinatura: "ativo",
    };
  }

  // Explicit upgrade
  if (e === "SWITCH_PLAN") {
    return { plan_status: "active", plano: "master", status_assinatura: "ativo" };
  }

  // Deactivations
  if (
    [
      "PURCHASE_CANCELED",
      "PURCHASE_REFUNDED",
      "PURCHASE_CHARGEBACK",
      "PURCHASE_EXPIRED",
      "SUBSCRIPTION_CANCELLATION",
      "PURCHASE_DELAYED",
      "PURCHASE_PROTEST",
    ].includes(e)
  ) {
    return { plan_status: "expired", plano: "free", status_assinatura: "inativo" };
  }

  return null;
}

// Build a stable per-event ID for idempotency.
function extractEventId(payload: Payload, event: string, email: string): string {
  return String(
    payload?.id ||
      payload?.event_id ||
      payload?.data?.purchase?.transaction ||
      payload?.data?.purchase?.order_ref ||
      payload?.data?.subscription?.subscriber?.code ||
      `${event}:${email}:${payload?.creation_date || payload?.data?.purchase?.approved_date || ""}`,
  );
}

export const Route = createFileRoute("/api/public/hotmart-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response("ok", { headers: corsHeaders }),
      POST: async ({ request }) => {
        const HOTTOK = process.env["HOTMART_HOTTOK"] || "";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let payload: Payload = {};
        const rawBody = await request.text();
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return json({ error: "invalid json" }, 400);
        }

        // ---- 1. Auth via hottok (header takes precedence over body) ----
        const receivedTok =
          request.headers.get("x-hotmart-hottok") || (payload.hottok as string) || "";
        if (!HOTTOK) {
          console.error("HOTMART_HOTTOK not configured");
          return json({ error: "server misconfigured" }, 500);
        }
        if (receivedTok !== HOTTOK) {
          await supabaseAdmin.from("webhook_logs").insert({
            provider: "hotmart",
            email: "unknown",
            evento: String(payload.event || "unknown"),
            success: false,
            error: "invalid hottok",
            payload,
          });
          return json({ error: "unauthorized" }, 401);
        }

        // ---- 2. Extract event + email ----
        const event = String(payload.event || payload?.data?.purchase?.status || "unknown");
        const email = String(
          payload?.data?.buyer?.email || payload?.buyer?.email || payload?.email || "",
        )
          .toLowerCase()
          .trim();

        const eventId = extractEventId(payload, event, email);
        const state = resolveState(event, payload);

        // ---- 3. Idempotency check ----
        const { data: existing } = await supabaseAdmin
          .from("payment_events")
          .select("id")
          .eq("provider", "hotmart")
          .eq("external_id", eventId)
          .maybeSingle();

        if (existing) {
          console.log(`[hotmart] duplicate event ${eventId} — already processed`);
          return json({ ok: true, duplicate: true });
        }

        // ---- 4. Apply state to profile ----
        try {
          let applied = false;
          if (email && state) {
            const { data: profile, error: pErr } = await supabaseAdmin
              .from("profiles")
              .select("id")
              .eq("email", email)
              .maybeSingle();

            if (pErr) throw pErr;

            if (profile?.id) {
              const { error: uErr } = await supabaseAdmin
                .from("profiles")
                .update(state)
                .eq("id", profile.id);
              if (uErr) throw uErr;
              applied = true;
            } else {
              console.warn(`[hotmart] profile not found for email=${email}`);
            }
          }

          await supabaseAdmin.from("payment_events").insert({
            provider: "hotmart",
            external_id: eventId,
            event_type: event,
            email: email || null,
            payload,
          });

          await supabaseAdmin.from("webhook_logs").insert({
            provider: "hotmart",
            email: email || "unknown",
            evento: event,
            plano_aplicado: state?.plano || null,
            success: true,
            error: applied ? null : "no matching profile or informational event",
            payload,
          });

          return json({ ok: true, applied });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[hotmart] processing error: ${msg}`);
          await supabaseAdmin.from("webhook_logs").insert({
            provider: "hotmart",
            email: email || "unknown",
            evento: event,
            success: false,
            error: msg,
            payload,
          });
          // 5xx → Hotmart will retry
          return json({ error: "processing failed", detail: msg }, 500);
        }
      },
    },
  },
});
