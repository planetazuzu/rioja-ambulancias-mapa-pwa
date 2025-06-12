
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Monitor, Download, Info } from 'lucide-react';

const InstallInstructions: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    console.log('Install prompt result:', result);
    setInstallPrompt(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Instalar App
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Instalar Ambulancias La Rioja
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {installPrompt && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">
                    ¡Instala la app directamente desde tu navegador!
                  </p>
                  <Button onClick={handleInstallClick} size="sm">
                    Instalar Ahora
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="android" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="android" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="ios" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                iOS
              </TabsTrigger>
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Escritorio
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="android" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Android (Chrome/Edge)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Abre esta página en <strong>Chrome</strong> o <strong>Edge</strong></li>
                    <li>Toca el menú de tres puntos (⋮) en la esquina superior derecha</li>
                    <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a pantalla de inicio"</strong></li>
                    <li>Confirma la instalación tocando <strong>"Instalar"</strong></li>
                    <li>La app aparecerá en tu pantalla de inicio como cualquier otra aplicación</li>
                  </ol>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Nota:</strong> Si no ves la opción de instalar, es posible que necesites actualizar tu navegador o que la función no esté disponible en tu dispositivo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">iOS (Safari)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Abre esta página en <strong>Safari</strong> (no funciona en Chrome para iOS)</li>
                    <li>Toca el botón de <strong>Compartir</strong> (📤) en la parte inferior</li>
                    <li>Desplázate hacia abajo y selecciona <strong>"Añadir a inicio"</strong></li>
                    <li>Personaliza el nombre si quieres y toca <strong>"Añadir"</strong></li>
                    <li>La app aparecerá en tu pantalla de inicio</li>
                  </ol>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Importante:</strong> Debes usar Safari para que funcione correctamente. Otros navegadores en iOS no soportan completamente las PWA.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="desktop" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Escritorio (Chrome/Edge/Firefox)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Chrome/Edge:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Busca el icono de <strong>"Instalar"</strong> (⬇️) en la barra de direcciones</li>
                        <li>Haz clic en el icono y luego en <strong>"Instalar"</strong></li>
                        <li>O ve al menú (⋮) → <strong>"Instalar Ambulancias La Rioja"</strong></li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Firefox:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Busca el icono de <strong>"Instalar"</strong> en la barra de direcciones</li>
                        <li>Haz clic y confirma la instalación</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Una vez instalada, la aplicación se abrirá en su propia ventana independiente, sin las barras del navegador.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ventajas de instalar la app:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Funciona sin conexión a internet</li>
                <li>Carga más rápido</li>
                <li>Acceso directo desde tu pantalla de inicio</li>
                <li>Notificaciones (si se habilitan en futuras versiones)</li>
                <li>Experiencia de app nativa</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallInstructions;
