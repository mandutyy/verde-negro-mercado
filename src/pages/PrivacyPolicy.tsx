import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Política de Privacidad</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="mb-8">
            <p className="text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introducción</h2>
            <p className="text-foreground/90 leading-relaxed">
              En PLANTHAUSE, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas nuestra plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Información que Recopilamos</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Recopilamos diferentes tipos de información para proporcionar y mejorar nuestros servicios:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Información de cuenta (nombre, correo electrónico, contraseña)</li>
              <li>Información de perfil (foto, biografía, ubicación)</li>
              <li>Contenido generado por el usuario (anuncios de plantas, mensajes, reseñas)</li>
              <li>Información de uso y actividad en la plataforma</li>
              <li>Datos técnicos (dirección IP, tipo de navegador, dispositivo)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Cómo Usamos tu Información</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Facilitar las transacciones entre usuarios</li>
              <li>Comunicarnos contigo sobre tu cuenta y nuestros servicios</li>
              <li>Personalizar tu experiencia en la plataforma</li>
              <li>Garantizar la seguridad y prevenir fraudes</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Compartir Información</h2>
            <p className="text-foreground/90 leading-relaxed">
              No vendemos tu información personal. Podemos compartir información con:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Otros usuarios (según lo necesario para las transacciones)</li>
              <li>Proveedores de servicios que nos ayudan a operar la plataforma</li>
              <li>Autoridades legales cuando sea requerido por ley</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Seguridad de los Datos</h2>
            <p className="text-foreground/90 leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, pérdida o alteración.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Tus Derechos</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Acceder a tu información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tu información</li>
              <li>Oponerte al procesamiento de tu información</li>
              <li>Solicitar la portabilidad de tus datos</li>
              <li>Retirar tu consentimiento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Cookies y Tecnologías Similares</h2>
            <p className="text-foreground/90 leading-relaxed">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia. Para más información, consulta nuestra{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => navigate('/cookies-policy')}
              >
                Política de Cookies
              </Button>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Cambios a esta Política</h2>
            <p className="text-foreground/90 leading-relaxed">
              Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cambios significativos publicando la nueva política en esta página.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Contacto</h2>
            <p className="text-foreground/90 leading-relaxed">
              Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos a través de la plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
