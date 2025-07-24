
import React, { useEffect } from 'react';
import AmbulanceMap from '../components/AmbulanceMap';
import InstallInstructions from '../components/InstallInstructions';
import { toast } from 'sonner';

const Index = () => {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
            toast.success('App lista para funcionar offline');
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Handle offline/online status
    const handleOnline = () => toast.success('Conexión restaurada');
    const handleOffline = () => toast.info('Modo offline - Los datos guardados siguen disponibles');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* Install button in top-right corner */}
      <div className="absolute top-4 right-4 z-[1000]">
        <InstallInstructions />
      </div>
      
      {/* Main map component */}
      <AmbulanceMap />
    </div>
  );
};

export default Index;
