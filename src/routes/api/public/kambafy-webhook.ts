// Kambafy webhook (Angola / Kz) — processa assinaturas pagas em Kwanza.
// - Sem HOTTOK: o Kambafy só precisa do URL. Se KAMBAFY_WEBHOOK_TOKEN estiver
//   configurado, é validado (header ou body) como camada extra opcional.
// - Idempotente através de payment_events
// - Devolve 5xx em erros transitórios para o Kambafy repetir o envio
import { createFileRoute } from "@tanstack/react-router";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-kambafy-token, x-webhook-token",
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

/** Normaliza o nome do evento vindo do Kambafy (aceita PT e EN). */
function normalizeEvent(payload: Payload): string {
  const raw = String(
    payload?.event || payload?.type || payload?.evento || payload?.status || "unknown",
  );
  return raw.toLowerCase().replace(/[\s-]+/g, "_");
}

/** Mapeia eventos do Kambafy → estado da assinatura. */
function resolveState(event: string, payload: Payload): State | null {
  const e = event;

  const activate = [
    "payment_approved",
    "pagamento_aprovado",
    "order_completed",
    "order_finished",
    "pedido_finalizado",
    "subscription_paid",
    "assinatura_paga",
    "product_purchased",
    "produto_comprado",
  ];

  const deactivate = [
    "payment_failed",
    "pagamento_falhou",
    "order_cancelled",
    "order_canceled",
    "pedido_cancelado",
    "subscription_expired",
    "assinatura_expirada",
    "subscription_cancelled",
    "assinatura_cancelada",
    "refunded",
    "reembolsado",
    "chargeback",
  ];

  if (activate.includes(e)) {
    const planName = String(
      payload?.data?.plan?.name ||
        payload?.plan?.name ||
        payload?.data?.subscription?.plan ||
        payload?.product?.name ||
        "",
    );
    const isAnnual = /anual|annual|year|master/i.test(planName);
    return {
      plan_status: "active",
      plano: isAnnual ? "master" : "monthly",
      status_assinatura: "ativo",
    };
  }

  if (deactivate.includes(e)) {
    return { plan_status: "expired", plano: "free", status_assinatura: "inativo" };
  }

  // "order_created" / "pedido_criado" / "user_registered" → informativo
  return null;
}

function extractEmail(payload: Payload): string {
  return String(
    payload?.data?.customer?.email ||
      payload?.customer?.email ||
      payload?.data?.buyer?.email ||
      payload?.buyer?.email ||
      payload?.data?.user?.email ||
      payload?.user?.email ||
      payload?.email ||
      "",
  )
    .toLowerCase()
    .trim();
}

function extractEventId(payload: Payload, event: string, email: string): string {
  return String(
    payload?.id ||
      payload?.event_id ||
      payload?.data?.id ||
      payload?.data?.order?.id ||
      payload?.order?.id ||
      payload?.data?.transaction_id ||
      payload?.reference ||
      `${event}:${email}:${payload?.created_at || payload?.date || ""}`,
  );
}

export const Route = createFileRoute("/api/public/kambafy-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response("ok", { headers: corsHeaders }),
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let payload: Payload = {};
        const rawBody = await request.text();
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return json({ error: "invalid json" }, 400);
        }

        // ---- 1. Token opcional (o Kambafy não exige) ----
        const expected = process.env["KAMBAFY_WEBHOOK_TOKEN"] || "";
        if (expected) {
          const received =
            request.headers.get("x-kambafy-token") ||
            request.headers.get("x-webhook-token") ||
            String(payload.token || "");
          if (received !== expected) {
            await supabaseAdmin.from("webhook_logs").insert({
              provider: "kambafy",
              email: "unknown",
              evento: normalizeEvent(payload),
              success: false,
              error: "invalid token",
              payload,
            });
            return json({ error: "unauthorized" }, 401);
          }
        }

        const event = normalizeEvent(payload);
        const email = extractEmail(payload);
        const eventId = extractEventId(payload, event, email);
        const state = resolveState(event, payload);

        // ---- 2. Idempotência ----
        const { data: existing } = await supabaseAdmin
          .from("payment_events")
          .select("id")
          .eq("provider", "kambafy")
          .eq("external_id", eventId)
          .maybeSingle();

        if (existing) {
          console.log(`[kambafy] evento duplicado ${eventId} — já processado`);
          return json({ ok: true, duplicate: true });
        }

        // ---- 3. Aplicar estado ao perfil ----
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
              console.warn(`[kambafy] perfil não encontrado para email=${email}`);
            }
          }

          await supabaseAdmin.from("payment_events").insert({
            provider: "kambafy",
            external_id: eventId,
            event_type: event,
            email: email || null,
            payload,
          });

          await supabaseAdmin.from("webhook_logs").insert({
            provider: "kambafy",
            email: email || "unknown",
            evento: event,
            plano_aplicado: state?.plano || null,
            success: true,
            error: applied ? null : "evento informativo ou perfil não encontrado",
            payload,
          });

          return json({ ok: true, applied });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[kambafy] erro no processamento: ${msg}`);
          await supabaseAdmin.from("webhook_logs").insert({
            provider: "kambafy",
            email: email || "unknown",
            evento: event,
            success: false,
            error: msg,
            payload,
          });
          return json({ error: "processing failed", detail: msg }, 500);
        }
      },
    },
  },
});
