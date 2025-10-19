import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("send-auth-email hook received:", payload);

    const userEmail = payload?.user?.email;
    const userName = payload?.user?.user_metadata?.name || userEmail?.split('@')[0] || 'Usuario';

    if (!userEmail) {
      console.error("No email found in payload");
      return new Response(JSON.stringify({ ok: true, email_sent: false }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Enviar email de bienvenida con Resend
    const emailResponse = await resend.emails.send({
      from: "Plantify <onboarding@resend.dev>",
      to: [userEmail],
      subject: "¡Bienvenido a Plantify!",
      html: `
        <h1>¡Hola ${userName}!</h1>
        <p>Tu cuenta en Plantify ha sido creada exitosamente.</p>
        <p>Ya puedes empezar a explorar y compartir tus plantas.</p>
        <p>Saludos,<br>El equipo de Plantify</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ ok: true, email_sent: true, message_id: emailResponse.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-auth-email error:", err);
    // Siempre devolvemos 200 para no bloquear el signup
    return new Response(JSON.stringify({ ok: true, email_sent: false, error: err.message }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
