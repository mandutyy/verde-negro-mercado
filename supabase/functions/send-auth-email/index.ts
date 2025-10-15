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
    // No bloqueamos el signup por fallos del hook: siempre 200
    console.log("send-auth-email hook received (length):", payload?.length ?? 0);

    // Si más adelante quieres reactivar el envío real, aquí se podría parsear el payload
    // y usar un proveedor de email (Resend). Por ahora devolvemos 200 para evitar errores 500.
    return new Response(JSON.stringify({ ok: true, email_sent: false }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-auth-email hook unexpected error:", err);
    // Incluso ante errores inesperados, devolvemos 200 para no romper el flujo
    return new Response(JSON.stringify({ ok: true, email_sent: false }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
