import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Centered modal */}
      <Card className="relative bg-card border-border shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Cookie className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Uso de Cookies y Datos
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizamos cookies esenciales para el funcionamiento de la aplicación, 
                análisis de uso y mejorar tu experiencia. Al continuar navegando, 
                aceptas nuestro uso de cookies según nuestra política de privacidad.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleAccept}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Aceptar Todas las Cookies
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              className="w-full"
            >
              Solo Cookies Esenciales
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;