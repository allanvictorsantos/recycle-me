import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import React from 'react'; 

// --- Estilo Dark Moderno (Snazzy Maps) ---
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

interface MarketData {
  id: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cnpj: string;
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '80vh', // Altura boa para desktop
  position: 'relative'
};

const defaultCenter = { lat: -23.550520, lng: -46.633308 };

const mapOptions: google.maps.MapOptions = {
  zoomControl: true,
  streetViewControl: false, // Desativei para limpar a interface
  mapTypeControl: false,    // Desativei para limpar a interface
  fullscreenControl: true,
  clickableIcons: false,    // Evita clicar em POIs do Google
};

function MapPage() {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [isMyLocationWindowOpen, setIsMyLocationWindowOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [myLocationIcon, setMyLocationIcon] = useState<google.maps.Symbol | null>(null);

  // Detecta Tema (Dark/Light)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
      const checkTheme = () => {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
      };
      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const fetchMarkets = async () => {
        try {
            const response = await fetch('http://localhost:3000/markets');
            if (!response.ok) throw new Error('Erro ao buscar pontos.');
            const data: MarketData[] = await response.json();
            const validMarkets = data.filter(m => m.latitude != null && m.longitude != null);
            setMarkets(validMarkets);
        } catch (error: any) {
            setApiError(error.message);
        }
    };
    fetchMarkets();
  }, [isLoaded]);

   useEffect(() => {
    if (isLoaded && window.google) {
        setMyLocationIcon({
            path: window.google.maps.SymbolPath.CIRCLE, 
            fillColor: '#10B981', // Verde da Marca
            fillOpacity: 1, 
            strokeColor: '#FFFFFF', 
            strokeWeight: 2, 
            scale: 8, // Ícone um pouco maior
        });
    }
  }, [isLoaded]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

   const findMyLocation = () => {
    if (!map || !navigator.geolocation) return;
    setIsLocating(true);
    setGeolocationError(null);
    setSelectedMarket(null);
    setIsMyLocationWindowOpen(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCurrentPosition(pos);
          map.panTo(pos);
          map.setZoom(15);
          setIsLocating(false);
      },
      (error) => {
          setGeolocationError("Não foi possível obter sua localização.");
          setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMarkerClick = (market: MarketData) => {
    setSelectedMarket(market);
    setIsMyLocationWindowOpen(false);
  };

  if (loadError) return <div className="text-red-500 p-8 text-center font-bold">Erro ao carregar mapa. Verifique sua chave API.</div>;
  if (!isLoaded) return <div className="text-center p-8 dark:text-white flex items-center justify-center h-96 gap-3"><i className="fas fa-spinner fa-spin text-3xl text-brand-green"></i> <span className="text-xl">Carregando mapa...</span></div>;

  return (
    <main className="container mx-auto my-6 px-4 md:px-0 relative">
      
      {geolocationError && (
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-center p-4">
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-full shadow-lg animate-bounce flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {geolocationError}
             </div>
        </div>
      )}
      
      {/* MOLDURA PREMIUM DO MAPA */}
      <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 relative group">
        
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition || defaultCenter}
          zoom={currentPosition ? 15 : 12}
          options={{
              ...mapOptions,
              styles: isDarkMode ? darkMapStyle : [], 
          }}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={() => setSelectedMarket(null)}
        >
          {currentPosition && myLocationIcon && (
              <Marker 
                position={currentPosition} 
                title="Você" 
                icon={myLocationIcon} 
                onClick={() => setIsMyLocationWindowOpen(true)} 
                zIndex={999} 
              />
          )}

          {markets.map(market => (
              market.latitude && market.longitude && (
              <Marker
                key={market.id}
                position={{ lat: market.latitude, lng: market.longitude }}
                onClick={() => handleMarkerClick(market)}
              />
            )
          ))}

          {/* --- CARD DE INFORMAÇÃO MODERNO (POPUP) --- */}
          {selectedMarket && selectedMarket.latitude && selectedMarket.longitude && (
            <InfoWindow
              position={{ lat: selectedMarket.latitude, lng: selectedMarket.longitude }}
              onCloseClick={() => setSelectedMarket(null)}
              options={{
                  pixelOffset: new window.google.maps.Size(0, -30), // Sobe um pouco para não cobrir o pino
                  disableAutoPan: false
              }}
            >
              <div className="p-1 min-w-[240px]">
                 <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                    <div className="w-8 h-8 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green">
                        <i className="fas fa-store"></i>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{selectedMarket.name}</h3>
                 </div>
                 
                 <p className="text-xs text-gray-500 mb-3 flex items-start gap-1">
                    <i className="fas fa-map-marker-alt mt-0.5 text-gray-400"></i>
                    {selectedMarket.address}
                 </p>
                 
                 {/* Botão Traçar Rota Moderno */}
                 <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarket.latitude},${selectedMarket.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-brand-dark text-white text-xs font-bold py-2.5 rounded-lg hover:bg-black transition-all shadow-md text-center no-underline flex items-center justify-center gap-2"
                 >
                    <i className="fas fa-directions"></i> TRAÇAR ROTA
                 </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

         {/* --- BOTÃO FLUTUANTE ESQUERDA (Onde Estou) --- */}
         <button
            onClick={findMyLocation}
            disabled={isLocating}
            className="absolute bottom-8 left-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-white p-4 rounded-2xl shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 transition-all z-10 border border-gray-100 dark:border-gray-700 group"
            title="Minha Localização"
        >
            {isLocating ? <i className="fas fa-spinner fa-spin text-brand-green"></i> : <i className="fas fa-crosshairs text-xl group-hover:text-brand-green transition-colors"></i>}
        </button>

        {/* --- BOTÃO FLUTUANTE DIREITA (Quero Reciclar - ESTILO HOME) --- */}
        <button
            onClick={() => navigate('/reciclar')}
            className="absolute bottom-8 right-6 md:right-8 bg-gradient-to-r from-brand-green to-emerald-600 text-white px-6 md:px-8 py-4 rounded-full shadow-2xl hover:scale-105 hover:shadow-green-500/40 transition-all z-10 flex items-center gap-3 font-black text-base md:text-lg tracking-wide btn-glow-green border-2 border-white/20"
        >
            <i className="fas fa-recycle text-2xl animate-spin-slow"></i> 
            <span className="hidden md:inline">QUERO RECICLAR</span>
            <span className="md:hidden">RECICLAR</span>
        </button>

      </div>
    </main>
  );
}

export default MapPage;