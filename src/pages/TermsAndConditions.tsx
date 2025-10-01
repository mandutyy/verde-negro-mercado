import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
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
          <h1 className="text-2xl font-bold">Términos y Condiciones de Uso</h1>
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
            <h2 className="text-2xl font-bold mb-4">1. Aceptación de los Términos</h2>
            <p className="text-foreground/90 leading-relaxed">
              Al acceder y utilizar PLANTHAUSE, aceptas estar sujeto a estos Términos y Condiciones de Uso. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestra plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Descripción del Servicio</h2>
            <p className="text-foreground/90 leading-relaxed">
              PLANTHAUSE es una plataforma que conecta a personas que desean vender, comprar o intercambiar plantas. Actuamos como intermediarios facilitando el contacto entre usuarios, pero no somos parte de las transacciones.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Registro y Cuenta de Usuario</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Para utilizar ciertas funciones de la plataforma, debes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Proporcionar información precisa y completa durante el registro</li>
              <li>Mantener la seguridad de tu cuenta y contraseña</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
              <li>Ser mayor de 18 años o tener el consentimiento de un tutor legal</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Responsabilidades del Usuario</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Como usuario de PLANTHAUSE, te comprometes a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Proporcionar información veraz sobre las plantas que publicas</li>
              <li>No publicar contenido ilegal, ofensivo o inapropiado</li>
              <li>Respetar los derechos de propiedad intelectual de terceros</li>
              <li>No utilizar la plataforma para actividades fraudulentas</li>
              <li>Cumplir con todas las leyes y regulaciones aplicables</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Publicación de Anuncios</h2>
            <p className="text-foreground/90 leading-relaxed">
              Al publicar anuncios de plantas, garantizas que tienes derecho a vender o intercambiar las plantas anunciadas y que la información proporcionada es precisa. Nos reservamos el derecho de eliminar anuncios que violen estos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Transacciones entre Usuarios</h2>
            <p className="text-foreground/90 leading-relaxed">
              Las transacciones se realizan directamente entre usuarios. PLANTHAUSE no es responsable de la calidad, seguridad o legalidad de las plantas, la veracidad de los anuncios, o la capacidad de los usuarios para completar transacciones.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Propiedad Intelectual</h2>
            <p className="text-foreground/90 leading-relaxed">
              Todo el contenido de la plataforma, incluyendo diseño, texto, gráficos y código, es propiedad de PLANTHAUSE o sus licenciantes y está protegido por leyes de propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Limitación de Responsabilidad</h2>
            <p className="text-foreground/90 leading-relaxed">
              PLANTHAUSE no será responsable de daños directos, indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar la plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Terminación</h2>
            <p className="text-foreground/90 leading-relaxed">
              Nos reservamos el derecho de suspender o terminar tu acceso a la plataforma en cualquier momento, sin previo aviso, por violación de estos términos o por cualquier otra razón.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Modificaciones</h2>
            <p className="text-foreground/90 leading-relaxed">
              Podemos modificar estos términos en cualquier momento. Los cambios entrarán en vigor al publicarse en esta página. Tu uso continuado de la plataforma constituye la aceptación de los términos modificados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Ley Aplicable</h2>
            <p className="text-foreground/90 leading-relaxed">
              Estos términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contacto</h2>
            <p className="text-foreground/90 leading-relaxed">
              Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos a través de la plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
