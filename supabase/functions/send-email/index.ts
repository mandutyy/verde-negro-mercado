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
    const headers = Object.fromEntries(req.headers);

    // Verify webhook signature from Supabase Auth
    let data: any;
    try {
      const wh = new Webhook(hookSecret);
      data = wh.verify(payload, headers) as {
        user: { email: string };
        email_data: {
          token: string;
          token_hash: string;
          redirect_to: string;
          email_action_type: string; // signup|magiclink|recovery|invite|email_change
        };
      };
    } catch (err) {
      console.error("Auth email webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "invalid_signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { user, email_data } = data;

    // Build magic link from provided payload
    const magicLink = `${SUPABASE_URL}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to || `${SUPABASE_URL}`)}`;

    const subjectMap: Record<string, string> = {
      signup: "Confirma tu correo",
      magiclink: "Accede con tu enlace mágico",
      recovery: "Recupera tu contraseña",
      invite: "Te hemos invitado a Plantify",
      email_change: "Confirma el cambio de correo",
    };

    const subject = subjectMap[email_data.email_action_type] || "Acción de autenticación";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; color: #0f172a;">
        <h2 style="margin: 0 0 12px 0;">${subject}</h2>
        <p style="margin: 0 0 12px 0;">Hola,</p>
        <p style="margin: 0 0 12px 0;">Haz clic en el siguiente botón para continuar:</p>
        <p style="margin: 16px 0;"><a href="${magicLink}" style="display:inline-block;background:#16a34a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Continuar</a></p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b;">Si no fuiste tú, puedes ignorar este correo.</p>
      </div>
    `;

    let emailError: any = null;
    try {
      const result = await resend.emails.send({
        from: "Plantify <onboarding@resend.dev>", // Cambia esto a tu dominio verificado cuando esté listo
        to: [user.email],
        subject,
        html,
      });
      if ((result as any)?.error) {
        emailError = (result as any).error;
        console.error("Resend returned error:", emailError);
      }
    } catch (err) {
      emailError = err;
      console.error("Resend threw error:", err);
    }

    // Siempre respondemos 200 para no romper el flujo de signup si el envío falla
    return new Response(JSON.stringify({ ok: true, email_sent: !emailError }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-email hook unexpected error:", err);
    // Aun en caso de error inesperado, devolvemos 200 para evitar el 500 en el hook
    return new Response(JSON.stringify({ ok: false, reason: err?.message || "unknown" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});