import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginEmailRequest {
  email: string;
  name?: string;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { email, name }: LoginEmailRequest = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const displayName = name && name.trim().length > 0 ? name : email.split("@")[0];

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; color: #0f172a;">
        <h2 style="margin: 0 0 12px 0;">Hola ${displayName} 👋</h2>
        <p style="margin: 0 0 12px 0;">Acabas de iniciar sesión correctamente en Plantify.</p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b;">Si no fuiste tú, te recomendamos cambiar tu contraseña cuanto antes.</p>
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #94a3b8;">Este es un mensaje automático, por favor no respondas a este correo.</p>
      </div>
    `;

    console.log('Sending login email to:', email);
    
    const { error } = await resend.emails.send({
      from: "Plantify <onboarding@resend.dev>",
      to: [email],
      subject: "Inicio de sesión en Plantify",
      html,
    });
    
    if (error) {
      console.error('Resend error:', error);
    } else {
      console.log('Login email sent successfully to:', email);
    }

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-login-email error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
