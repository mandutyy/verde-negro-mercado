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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <Card className="bg-card/95 backdrop-blur-sm border-border shadow-lg">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Uso de Cookies y Datos
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utilizamos cookies esenciales para el funcionamiento de la aplicación, 
                análisis de uso y mejorar tu experiencia. Al continuar navegando, 
                aceptas nuestro uso de cookies según nuestra política de privacidad.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="text-xs"
            >
              Solo Esenciales
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="text-xs bg-primary hover:bg-primary/90"
            >
              Aceptar Todas
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Overlay for mobile to ensure visibility */}
      <div className="fixed inset-0 bg-background/20 backdrop-blur-[1px] -z-10 pointer-events-none" />
    </div>
  );
};

export default CookieConsent;