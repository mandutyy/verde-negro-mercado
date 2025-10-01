import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CookiesPolicy = () => {
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
          <h1 className="text-2xl font-bold">Política de Cookies</h1>
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
            <h2 className="text-2xl font-bold mb-4">1. ¿Qué son las Cookies?</h2>
            <p className="text-foreground/90 leading-relaxed">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y proporcionen información a los propietarios del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Cómo Usamos las Cookies</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              En PLANTHAUSE utilizamos cookies para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Mantener tu sesión activa y recordar tus preferencias</li>
              <li>Analizar cómo utilizas nuestra plataforma</li>
              <li>Mejorar la funcionalidad y el rendimiento del sitio</li>
              <li>Personalizar tu experiencia en la plataforma</li>
              <li>Garantizar la seguridad de tu cuenta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Tipos de Cookies que Utilizamos</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">3.1. Cookies Esenciales</h3>
              <p className="text-foreground/90 leading-relaxed">
                Estas cookies son necesarias para el funcionamiento básico de la plataforma. Sin ellas, no podríamos proporcionar servicios fundamentales como el inicio de sesión o la gestión de tu carrito.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">3.2. Cookies de Rendimiento</h3>
              <p className="text-foreground/90 leading-relaxed">
                Estas cookies nos ayudan a entender cómo interactúas con nuestra plataforma, recopilando información sobre las páginas visitadas y cualquier error que puedas encontrar.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">3.3. Cookies de Funcionalidad</h3>
              <p className="text-foreground/90 leading-relaxed">
                Estas cookies permiten que la plataforma recuerde las elecciones que haces (como tu idioma o región) y proporcionen características mejoradas y más personales.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">3.4. Cookies de Análisis</h3>
              <p className="text-foreground/90 leading-relaxed">
                Utilizamos estas cookies para recopilar información sobre cómo se utiliza nuestra plataforma, lo que nos ayuda a mejorar su funcionamiento y experiencia de usuario.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Cookies de Terceros</h2>
            <p className="text-foreground/90 leading-relaxed">
              Algunos de nuestros socios de servicio pueden establecer cookies en tu dispositivo cuando visitas nuestra plataforma. No tenemos control sobre estas cookies, que están sujetas a las políticas de privacidad de los terceros respectivos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Gestionar tus Preferencias de Cookies</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Puedes controlar y/o eliminar las cookies según desees. Puedes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Eliminar todas las cookies que ya están en tu dispositivo</li>
              <li>Configurar la mayoría de los navegadores para evitar que se coloquen cookies</li>
              <li>Modificar tus preferencias en cualquier momento a través de la configuración de tu navegador</li>
            </ul>
            <p className="text-foreground/90 leading-relaxed mt-4">
              Ten en cuenta que si eliminas o rechazas las cookies, algunas funcionalidades de la plataforma pueden verse afectadas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Cambios en esta Política</h2>
            <p className="text-foreground/90 leading-relaxed">
              Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en las cookies que utilizamos o por otras razones operativas, legales o regulatorias.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Más Información</h2>
            <p className="text-foreground/90 leading-relaxed">
              Para más información sobre cómo protegemos tu privacidad, consulta nuestra{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => navigate('/privacy-policy')}
              >
                Política de Privacidad
              </Button>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Contacto</h2>
            <p className="text-foreground/90 leading-relaxed">
              Si tienes preguntas sobre nuestra Política de Cookies, puedes contactarnos a través de la plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
