import { Resend } from "npm:resend@4.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_AUTH_EMAIL_HOOK_SECRET") as string;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    // Importante: nunca bloquear el signup por fallos del hook
    console.log("send-email hook received (length):", payload?.length ?? 0);

    // Si más adelante quieres reactivar el envío real, podemos parsear el payload
    // y usar Resend. De momento respondemos 200 siempre para evitar errores 500.
    return new Response(JSON.stringify({ ok: true, email_sent: false }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-email hook unexpected error:", err);
    // Incluso ante errores inesperados, devolvemos 200 para no romper el flujo
    return new Response(JSON.stringify({ ok: true, email_sent: false }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});