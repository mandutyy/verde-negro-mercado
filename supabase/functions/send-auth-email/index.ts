import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const SUPABASE_URL = "https://qxyngdiehpsaublqlnkq.supabase.co";
// URL de la app de producción - cambia esto a tu dominio de producción cuando lo tengas
const APP_URL = Deno.env.get("APP_URL") || "https://plantify.lovable.app";

const hookSecretRaw =
  Deno.env.get("SEND_AUTH_EMAIL_HOOK_SECRET") ?? Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";
const hookSecret = hookSecretRaw.replace("v1,whsec_", "");

type HookPayload = {
  user: {
    email: string;
    email_new?: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
    old_email: string;
  };
};

function buildVerifyLink(params: { tokenHash: string; type: string }) {
  const token = encodeURIComponent(params.tokenHash);
  const type = encodeURIComponent(params.type);
  // Siempre redirigir a la app, ignorando el redirect_to original
  const redirect = encodeURIComponent(APP_URL);
  return `${SUPABASE_URL}/auth/v1/verify?token=${token}&type=${type}&redirect_to=${redirect}`;
}

function subjectFor(actionType: string) {
  switch (actionType) {
    case "signup":
      return "Confirma tu cuenta en Plantify";
    case "recovery":
      return "Restablece tu contraseña en Plantify";
    case "magiclink":
      return "Tu enlace de acceso a Plantify";
    case "invite":
      return "Invitación a Plantify";
    case "email_change":
      return "Confirma el cambio de email en Plantify";
    default:
      return `Acción de cuenta (${actionType}) - Plantify`;
  }
}

function titleFor(actionType: string) {
  switch (actionType) {
    case "signup":
      return "Confirma tu cuenta";
    case "recovery":
      return "Restablece tu contraseña";
    case "magiclink":
      return "Inicia sesión";
    case "invite":
      return "Has sido invitado";
    case "email_change":
      return "Confirma el cambio de email";
    default:
      return "Acción requerida";
  }
}

function buildEmailHtml(params: { title: string; link: string }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; color: #0f172a;">
      <h2 style="margin:0 0 12px 0;">${params.title}</h2>
      <p style="margin:0 0 14px 0; color:#334155;">Haz clic en el botón para continuar:</p>
      <p style="margin: 18px 0 24px 0;">
        <a href="${params.link}" style="display:inline-block; background:#38e07b; color:#122118; text-decoration:none; padding:12px 16px; border-radius:12px; font-weight:700;">
          Continuar
        </a>
      </p>
      <p style="margin:0; font-size:12px; color:#64748b;">Si no solicitaste esto, puedes ignorar este correo.</p>
    </div>
  `;
}

async function sendEmail(to: string, actionType: string, link: string) {
  const { error } = await resend.emails.send({
    from: "Plantify <onboarding@resend.dev>",
    to: [to],
    subject: subjectFor(actionType),
    html: buildEmailHtml({ title: titleFor(actionType), link }),
  });

  if (error) throw error;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  try {
    if (!hookSecret) {
      throw new Error("Missing SEND_AUTH_EMAIL_HOOK_SECRET / SEND_EMAIL_HOOK_SECRET");
    }

    const wh = new Webhook(hookSecret);
    const { user, email_data } = wh.verify(payload, headers) as HookPayload;

    const actionType = email_data.email_action_type;

    // Default flow: one email + token_hash
    if (actionType !== "email_change") {
      const link = buildVerifyLink({
        tokenHash: email_data.token_hash,
        type: actionType,
      });

      await sendEmail(user.email, actionType, link);
    } else {
      // Email change can require 1 or 2 emails depending on Secure Email Change.
      const currentEmail = user.email;
      const newEmail = (user as any).email_new;

      if (email_data.token_hash_new && currentEmail) {
        const linkCurrent = buildVerifyLink({
          tokenHash: email_data.token_hash_new,
          type: actionType,
        });
        await sendEmail(currentEmail, actionType, linkCurrent);
      }

      if (email_data.token_hash && newEmail) {
        const linkNew = buildVerifyLink({
          tokenHash: email_data.token_hash,
          type: actionType,
        });
        await sendEmail(newEmail, actionType, linkNew);
      }

      // If we can't detect new email, send at least one to the current email.
      if (!newEmail) {
        const fallbackLink = buildVerifyLink({
          tokenHash: email_data.token_hash || email_data.token_hash_new,
          type: actionType,
        });
        await sendEmail(currentEmail, actionType, fallbackLink);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-auth-email (send email hook) error:", error?.message ?? error);

    // IMPORTANT: if we return 200 here, Supabase will consider it sent (but it isn't).
    // Returning 401/500 makes failures visible in the dashboard logs.
    return new Response(
      JSON.stringify({
        error: {
          message: error?.message || "Unknown error",
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

