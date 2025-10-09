import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { AuthEmail } from './_templates/auth-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  console.log('Received auth email request')
  
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method)
    return new Response('Method not allowed', { status: 400 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Processing webhook payload')
    
    const wh = new Webhook(hookSecret)
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
      }
    }

    console.log('Generating email HTML for:', user.email)
    
    const html = await renderAsync(
      React.createElement(AuthEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        token,
        token_hash,
        redirect_to,
        email_action_type,
        user_email: user.email,
      })
    )

    console.log('Sending email via Resend')
    
    const { data, error } = await resend.emails.send({
      from: 'Planthause <onboarding@resend.dev>',
      to: [user.email],
      subject: email_action_type === 'signup' 
        ? '¡Bienvenido a Planthause! 🌱' 
        : 'Inicia sesión en Planthause',
      html,
    })
    
    if (error) {
      console.error('Resend error:', error)
      throw error
    }
    
    console.log('Email sent successfully:', data)
    
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in send-auth-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          details: error.toString(),
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
