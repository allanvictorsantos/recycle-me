import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import React from 'react'; 

// --- Estilo Dark Moderno ---
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
  height: '100%',
  position: 'relative'
};

const defaultCenter = { lat: -23.550520, lng: -46.633308 };

const mapOptions: google.maps.MapOptions = {
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  clickableIcons: false,
};

function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [myLocationIcon, setMyLocationIcon] = useState<google.maps.Symbol | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Estados de Rota
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [routeIndex, setRouteIndex] = useState(0); 
  const [travelMode, setTravelMode] = useState<'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT'>('DRIVING');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
      const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const fetchMarkets = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/markets`);
            if (response.ok) {
                const data: MarketData[] = await response.json();
                setMarkets(data.filter(m => m.latitude != null && m.longitude != null));
            }
        } catch (error) { console.error("Erro ao buscar mercados"); }
    };
    fetchMarkets();
    
    if (window.google) {
        setMyLocationIcon({
            path: window.google.maps.SymbolPath.CIRCLE, fillColor: '#10B981', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 2, scale: 8,
        });
    }
  }, [isLoaded]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const findMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCurrentPosition(pos);
          if(map) { map.panTo(pos); map.setZoom(15); }
          setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  }, [map]);

  const calculateRoute = async (mode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT', target?: MarketData) => {
      const destinationMarket = target || selectedMarket;
      if (!currentPosition || !destinationMarket?.latitude || !destinationMarket?.longitude) {
          findMyLocation(); 
          return;
      }

      const directionsService = new google.maps.DirectionsService();
      try {
          const results = await directionsService.route({
              origin: currentPosition,
              destination: { lat: destinationMarket.latitude, lng: destinationMarket.longitude },
              travelMode: google.maps.TravelMode[mode],
              provideRouteAlternatives: true 
          });

          if (results && results.routes.length > 0) {
              setDirectionsResponse(results);
              setRouteIndex(0); 
          }
      } catch (error) {
          console.error("Erro na rota:", error);
      }
  };

  useEffect(() => {
    if (!map) return;
    const marketToRoute = location.state?.routeToMarket;
    
    if (marketToRoute) {
        if (!currentPosition) {
            findMyLocation(); 
        } else {
            setSelectedMarket(marketToRoute);
            setIsSidebarOpen(true);
            calculateRoute('DRIVING', marketToRoute);
        }
    }
  }, [location.state, currentPosition, map, findMyLocation]);

  const handleMarkerClick = (market: MarketData) => {
    setSelectedMarket(market);
    setDirectionsResponse(null); 
    setIsSidebarOpen(true); 
  };

  const handleModeChange = (mode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT') => {
      setTravelMode(mode);
      if (selectedMarket) calculateRoute(mode);
  };

  if (loadError) return <div className="text-red-500 p-8 text-center font-bold">Erro ao carregar mapa.</div>;
  if (!isLoaded) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white"><i className="fas fa-spinner fa-spin text-4xl text-brand-green"></i></div>;

  return (
    <div className="relative w-full h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-gray-100 dark:bg-gray-900">
      
      <aside className={`absolute md:relative z-20 top-0 left-0 h-full w-full md:w-[400px] bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0'} flex flex-col`}>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400"><i className="fas fa-times text-xl"></i></button>

          {/* --- ÁREA SCROLLÁVEL (Info, Transporte, Lista de Rotas) --- */}
          <div className="p-6 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <h2 className="text-2xl font-black text-brand-dark dark:text-white mb-1">Explorar</h2>
              <p className="text-sm text-gray-500 mb-6">Encontre o ponto mais próximo.</p>

              {!selectedMarket ? (
                  <div className="text-center py-10 opacity-50">
                      <i className="fas fa-map-marked-alt text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                      <p className="text-gray-500">Selecione um ponto no mapa <br/> para ver detalhes e rotas.</p>
                      <button onClick={findMyLocation} className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"><i className="fas fa-crosshairs mr-2"></i> Onde estou?</button>
                  </div>
              ) : (
                  <div className="animate-fadeIn">
                      <div className="bg-brand-green/10 p-4 rounded-2xl mb-6 border border-brand-green/20">
                          <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center text-lg shadow-sm"><i className="fas fa-store"></i></div>
                              <h3 className="font-bold text-lg text-brand-dark dark:text-white leading-tight">{selectedMarket.name}</h3>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 ml-13">{selectedMarket.address}</p>
                      </div>

                      <div className="mb-6">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Como você vai?</p>
                          <div className="grid grid-cols-4 gap-2">
                              {[{ id: 'DRIVING', icon: 'fa-car', label: 'Carro' }, { id: 'WALKING', icon: 'fa-walking', label: 'A Pé' }, { id: 'BICYCLING', icon: 'fa-bicycle', label: 'Bike' }, { id: 'TRANSIT', icon: 'fa-bus', label: 'Bus' }].map((mode) => (
                                  <button key={mode.id} onClick={() => handleModeChange(mode.id as any)} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${travelMode === mode.id ? 'bg-brand-green text-white shadow-lg scale-105' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}`}>
                                      <i className={`fas ${mode.icon} text-lg mb-1`}></i>
                                      <span className="text-[10px] font-bold">{mode.label}</span>
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* LISTA DE ROTAS SCROLLÁVEL */}
                      {directionsResponse && (
                          <div className="space-y-3 mb-4">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rotas Sugeridas ({directionsResponse.routes.length})</p>
                              {directionsResponse.routes.map((route, index) => (
                                  <div 
                                    key={index} 
                                    onClick={() => setRouteIndex(index)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        routeIndex === index 
                                        ? 'border-brand-green bg-brand-green/5 shadow-md' 
                                        : 'border-gray-100 dark:border-gray-700 hover:border-brand-green/30'
                                    }`}
                                  >
                                      <div className="flex justify-between items-center mb-1">
                                          <span className={`text-sm font-black ${routeIndex === index ? 'text-brand-green' : 'text-gray-600 dark:text-gray-300'}`}>
                                              Opção {index + 1} {index === 0 && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Rápida</span>}
                                          </span>
                                          <span className="text-lg font-bold text-brand-dark dark:text-white">
                                              {route.legs[0]?.duration?.text}
                                          </span>
                                      </div>
                                      <div className="flex justify-between text-xs text-gray-500">
                                          <span>Via {route.summary}</span>
                                          <span className="font-bold">{route.legs[0]?.distance?.text}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>

          {/* --- ÁREA FIXA DE AÇÃO (FOOTER DA SIDEBAR) --- */}
          {selectedMarket && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0 z-20 space-y-3">
                  <button onClick={() => navigate('/reciclar', { state: { preSelectedMarket: selectedMarket } })} className="w-full py-4 bg-brand-dark hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 btn-glow-dark">
                      <i className="fas fa-recycle text-brand-green"></i> RECICLAR AQUI
                  </button>
                  {!directionsResponse && (
                      <button onClick={() => calculateRoute(travelMode)} className="w-full py-3 border-2 border-brand-green text-brand-green font-bold rounded-xl hover:bg-brand-green hover:text-white transition-colors">
                          Ver Rota no Mapa
                      </button>
                  )}
              </div>
          )}
      </aside>

      <div className="flex-grow relative h-full">
        {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-brand-dark dark:text-white hover:scale-110 transition-transform"><i className="fas fa-bars text-xl"></i></button>
        )}

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition || defaultCenter}
          zoom={currentPosition ? 15 : 12}
          options={{
              ...mapOptions,
              styles: isDarkMode ? darkMapStyle : [],
              disableDefaultUI: false, 
          }}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }}
        >
          {currentPosition && myLocationIcon && <Marker position={currentPosition} icon={myLocationIcon} zIndex={999} />}
          {markets.map(market => (market.latitude && market.longitude && <Marker key={market.id} position={{ lat: market.latitude, lng: market.longitude }} onClick={() => handleMarkerClick(market)} onMouseOver={() => setSelectedMarket(market)} />))}
          
          {directionsResponse && (
            <DirectionsRenderer 
                directions={directionsResponse} 
                routeIndex={routeIndex} 
                options={{
                    suppressMarkers: true, 
                    polylineOptions: { strokeColor: "#4285F4", strokeWeight: 6, strokeOpacity: 0.8 }
                }}
            />
          )}
        </GoogleMap>
        
        {/* AQUI ESTÁ A MUDANÇA: 'right-6' virou 'left-6' */}
        <button 
          onClick={findMyLocation} 
          disabled={isLocating} 
          className="absolute bottom-6 left-6 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-white hover:text-brand-green transition-colors" 
          title="Minha Localização"
        >
            <i className="fas fa-crosshairs text-lg"></i>
        </button>
      </div>
    </div>
  );
}

export default MapPage;