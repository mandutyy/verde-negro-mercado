import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface AuthEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const AuthEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: AuthEmailProps) => {
  const isSignup = email_action_type === 'signup'
  const title = isSignup ? 'Bienvenido a Planthause' : 'Inicia sesión en Planthause'
  const greeting = isSignup 
    ? '¡Bienvenido a Planthause! 🌱' 
    : 'Solicitud de inicio de sesión'
  
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Planthause</Heading>
            <Text style={tagline}>Tu marketplace de plantas 🌿</Text>
          </Section>
          
          <Section style={content}>
            <Heading style={h2}>{greeting}</Heading>
            
            {isSignup ? (
              <Text style={text}>
                Gracias por registrarte en Planthause. Estamos emocionados de tenerte con nosotros.
                Para completar tu registro y comenzar a explorar el mundo de las plantas, 
                haz clic en el botón de abajo.
              </Text>
            ) : (
              <Text style={text}>
                Hemos recibido una solicitud para iniciar sesión en tu cuenta de Planthause.
                Si fuiste tú, haz clic en el botón de abajo para acceder.
              </Text>
            )}
            
            <Section style={buttonContainer}>
              <Link
                href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
                style={button}
              >
                {isSignup ? 'Confirmar registro' : 'Iniciar sesión'}
              </Link>
            </Section>
            
            <Text style={text}>
              O copia y pega este código temporal:
            </Text>
            <code style={code}>{token}</code>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              Si no solicitaste esto, puedes ignorar este correo de forma segura.
            </Text>
            <Text style={footer}>
              Enviado con 💚 por el equipo de Planthause
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default AuthEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#122118',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#96c5a9',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
}

const tagline = {
  color: '#96c5a9',
  fontSize: '14px',
  margin: '8px 0 0',
  opacity: '0.8',
}

const content = {
  padding: '32px 24px',
}

const h2 = {
  color: '#122118',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#96c5a9',
  borderRadius: '8px',
  color: '#122118',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const code = {
  display: 'inline-block',
  padding: '16px 24px',
  width: '90%',
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  color: '#122118',
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  textAlign: 'center' as const,
}

const hr = {
  borderColor: '#e0e0e0',
  margin: '32px 0',
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
  textAlign: 'center' as const,
}
