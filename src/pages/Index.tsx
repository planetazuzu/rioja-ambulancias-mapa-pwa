
import { useState } from 'react';
import AmbulanceMap from '../components/AmbulanceMap';
import MapSidebar from '../components/MapSidebar';
import InstallInstructions from '../components/InstallInstructions';
import { Ambulance } from '../types/ambulance';
import useAmbulanceMap from '../hooks/useAmbulanceMap';
import { ambulanceData } from '../data/ambulances';
import { Sidebar } from '../components/ui/sidebar';
import { Ambulance as AmbulanceIcon, Menu } from 'lucide-react';

export default function Index() {
  const [filters, setFilters] = useState<Partial<Record<keyof Ambulance, any>>>({});
  const { mapContainerRef, userLocation, filteredAmbulances } = useAmbulanceMap(filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
        <MapSidebar
          filters={filters}
          setFilters={setFilters}
          userLocation={userLocation}
          ambulanceCount={filteredAmbulances.length}
        />
      </Sidebar>
      <main className="flex-1 flex flex-col relative">
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <AmbulanceIcon className="h-7 w-7 text-red-600" />
              <h1 className="text-xl font-bold text-gray-800">
                <span className="text-red-600">Ambulancias</span> La Rioja
              </h1>
            </div>
          </div>
          <InstallInstructions />
        </header>

        <AmbulanceMap mapContainerRef={mapContainerRef} />
      </main>
    </div>
  );
}
