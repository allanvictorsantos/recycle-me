import { useState, useEffect, useCallback } from 'react';
// Garante que os tipos do Google Maps estejam disponíveis
/// <reference types="@types/google.maps" />
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import React from 'react'; // Necessário para React.CSSProperties

// --- Interface para os dados do Mercado (Mantida) ---
interface MarketData {
  id: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cnpj: string;
  cep?: string | null;
  numero?: string | null;
}

// --- Configurações (Mantidas) ---
const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '75vh',
  position: 'relative' // Necessário para o botão
};
const defaultCenter = {
  lat: -23.550520,
  lng: -46.633308
};
const mapOptions: google.maps.MapOptions = {
  zoomControl: true,         // Manter controle de zoom
  streetViewControl: true,   // ATIVA o "bonequinho" (Pegman)
  mapTypeControl: true,      // ATIVA o seletor Mapa/Satélite
  fullscreenControl: true,
};

// Componente da Página do Mapa
function MapPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  // Estados
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
  // --- NOVO: Estados para geolocalização ---
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null); // Posição atual, começa null
  const [geolocationError, setGeolocationError] = useState<string | null>(null); // Erro na geoloc
  const [isMyLocationWindowOpen, setIsMyLocationWindowOpen] = useState(false); // Visibilidade da InfoWindow do usuário
  const [isLocating, setIsLocating] = useState(false); // Feedback enquanto busca localização
  // --- NOVO: Estado para o ícone azul ---
  const [myLocationIcon, setMyLocationIcon] = useState<google.maps.Symbol | null>(null);


  // Efeito para buscar mercados (Mantido)
  useEffect(() => {
    if (!isLoaded) return;
    console.log("[Effect] isLoaded=true, buscando mercados...");
    const fetchMarkets = async () => {
        setApiError(null);
        try {
            const response = await fetch('http://localhost:3000/markets');
            if (!response.ok) {
              let errorMsg = `Erro ${response.status}: Não foi possível buscar os pontos.`;
              try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
              throw new Error(errorMsg);
            }
            const data: MarketData[] = await response.json();
            const validMarkets = data.filter(m => m.latitude != null && m.longitude != null);
            setMarkets(validMarkets);
            console.log("Mercados carregados:", validMarkets);
        } catch (error: any) {
            console.error("Erro ao buscar mercados:", error);
            setApiError(error.message || 'Ocorreu um erro ao buscar os pontos.');
        }
    };
    fetchMarkets();
  }, [isLoaded]); // Dependência: isLoaded

   // --- NOVO: Efeito para inicializar Ícone AZUL ---
   useEffect(() => {
    console.log("[Effect] para ícone MyLocation. isLoaded?", isLoaded);
    if (isLoaded) {
        if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.SymbolPath) {
            console.log("Definindo ícone MyLocation...");
            const blueIcon: google.maps.Symbol = { // Cria objeto com tipo explícito
                path: window.google.maps.SymbolPath.CIRCLE, fillColor: '#4285F4', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 1.5, scale: 7,
            };
            setMyLocationIcon(blueIcon);   // Setter usado
            console.log("Ícone MyLocation definido no estado.");
        } else {
            console.error("ERRO CRÍTICO: window.google.maps ou SymbolPath não disponível!");
            setApiError("Erro ao carregar recursos essenciais do mapa.");
        }
    }
  }, [isLoaded]); // Dependência correta


  // Funções de Callback (Mantidas) - onLoad agora é simples
  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    console.log("--- Mapa Carregado (onLoad chamado)! ---");
    setMap(mapInstance);
    // Não busca geoloc aqui, espera o botão
  }, []);

  const onUnmount = useCallback(() => {
    console.log("--- Mapa Desmontado (onUnmount chamado) ---");
    setMap(null);
  }, []);

   // --- NOVO: Função para buscar e centralizar na localização atual (Botão) ---
   const findMyLocation = () => {
    // Verifica se temos o mapa e se o navegador suporta geolocalização
    if (!map || !navigator.geolocation) {
        setGeolocationError("Geolocalização não é suportada ou o mapa não carregou.");
        console.error("findMyLocation falhou: Mapa não pronto ou geolocalização não suportada.");
        return;
    }

    console.log("Botão 'Onde estou?' clicado. Tentando obter geolocalização...");
    setIsLocating(true); // Ativa feedback visual no botão
    setGeolocationError(null); // Limpa erros anteriores
    // Fecha janelas abertas para evitar sobreposição
    setSelectedMarket(null);
    setIsMyLocationWindowOpen(false);

    // Chama a API de geolocalização do navegador
    navigator.geolocation.getCurrentPosition(
      (position) => { // Callback de sucesso
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          console.log("Localização encontrada (botão):", pos);
          setCurrentPosition(pos); // Guarda a posição encontrada no estado
          map.panTo(pos);          // Move o centro do mapa para a nova posição
          map.setZoom(15);         // Aplica um zoom mais próximo
          setIsLocating(false);    // Desativa feedback visual de carregamento
          // Opcional: abrir InfoWindow automaticamente após encontrar?
          // setIsMyLocationWindowOpen(true);
      },
      (error) => { // Callback de erro
          // Mantém a posição atual (se houver) ou defaultCenter
          let errorMsg = `Erro ${error.code}: ${error.message}`;
          console.error("Erro ao obter geolocalização (botão):", errorMsg, error);
          setGeolocationError(errorMsg); // Mostra o erro para o usuário
          setIsLocating(false);    // Desativa feedback visual de carregamento
          // Opcional: Voltar para a visão padrão se der erro?
          // setCurrentPosition(null); // Forçaria a usar defaultCenter na próxima renderização
          // map.panTo(defaultCenter);
          // map.setZoom(12);
      },
      // Opções para a busca de geolocalização
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handlers para InfoWindow (reintroduzidos e completos)
  const handleMarkerClick = (market: MarketData) => {
    console.log("Marcador de mercado clicado:", market.name);
    setSelectedMarket(market);
    setIsMyLocationWindowOpen(false); // Fecha a outra janela
  };
  const handleMyLocationMarkerClick = () => {
    console.log("Marcador 'Minha Localização' clicado.");
    setIsMyLocationWindowOpen(true);
    setSelectedMarket(null); // Fecha a outra janela
  };
  const handleCloseAllInfoWindows = () => { // Renomeado para clareza
    console.log("Fechando InfoWindows.");
    setSelectedMarket(null);
    setIsMyLocationWindowOpen(false);
  };


  // Renderização Condicional
  if (loadError) return <main className="container mx-auto p-8 text-center text-red-500"><h1>Erro ao carregar API Google Maps</h1><p>{loadError.message}</p></main>;
  // Espera apenas API carregar (mapa começa em SP)
  if (!isLoaded) return <main className="container mx-auto p-8 text-center"><h1 className="text-xl font-semibold dark:text-white">Carregando API do Mapa...</h1></main>;
   // Mostra erro da busca de mercados APÓS API do Google carregar
  if (apiError) return <main className="container mx-auto p-8 text-center text-red-500"><h1>Erro ao buscar dados</h1><p>{apiError}</p></main>;

  // Se chegou aqui, isLoaded = true
  console.log("API Carregada. Renderizando GoogleMap...");
  // Define o centro baseado na posição atual OU no default
  const mapCenter = currentPosition || defaultCenter;

  return (
    <main className="container mx-auto my-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold text-center mb-6 dark:text-white">Pontos de Coleta</h1>
      {/* --- NOVO: Exibe erro de geoloc se houver --- */}
      {geolocationError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
              <p className="font-bold">Aviso de Localização</p>
              <p>{geolocationError}</p>
          </div>
      )}
      {/* Container relativo para o botão */}
      <div className="rounded-lg overflow-hidden shadow-lg border dark:border-gray-700 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter} // Usa a posição atual OU default
          // Ajusta zoom inicial baseado se já temos posição ou não
          zoom={currentPosition ? (currentPosition === defaultCenter ? 12 : 15) : 12}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleCloseAllInfoWindows}
        >
          {/* --- NOVO: Marcador da Posição Atual (Azul) --- */}
          {/* Só mostra se a posição foi encontrada E não é a padrão de SP E o ícone azul está pronto */}
          {currentPosition && currentPosition !== defaultCenter && myLocationIcon && (
              <Marker
                  position={currentPosition}
                  title="Sua Localização"
                  icon={myLocationIcon} // Usa o ícone azul do estado
                  onClick={handleMyLocationMarkerClick} // Abre a janela "Você está aqui"
              />
          )}

          {/* Marcadores dos Mercados (Padrão Vermelho) */}
          {markets.map(market => (
             market.latitude && market.longitude && (
              <Marker
                key={market.id}
                position={{ lat: market.latitude, lng: market.longitude }}
                title={market.name}
                // Sem 'icon' usa o marcador vermelho padrão
                onClick={() => handleMarkerClick(market)}
              />
            )
          ))}

          {/* InfoWindow dos Mercados */}
          {selectedMarket && selectedMarket.latitude && selectedMarket.longitude && (
            <InfoWindow
              position={{ lat: selectedMarket.latitude, lng: selectedMarket.longitude }}
              onCloseClick={handleCloseAllInfoWindows}
            >
              <div className="p-2 max-w-xs text-gray-800">
                 <h3 className="font-bold text-md mb-1">{selectedMarket.name}</h3>
                 <p className="text-sm">{selectedMarket.address || "Endereço não disponível"}</p>
              </div>
            </InfoWindow>
          )}

           {/* --- NOVO: InfoWindow da Localização Atual --- */}
           {isMyLocationWindowOpen && currentPosition && (
            <InfoWindow
              position={currentPosition}
              onCloseClick={handleCloseAllInfoWindows}
            >
              <div className="p-2 text-gray-800">
                <p className="font-semibold">Você está aqui!</p>
                {/* Mostra coordenadas para debug */}
                <p className='text-xs'>({currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)})</p>
              </div>
            </InfoWindow>
          )}

        </GoogleMap>

         {/* --- NOVO: Botão Flutuante "Onde Estou?" --- */}
         <button
            onClick={findMyLocation} // Chama a função para buscar localização
            disabled={isLocating || !map || !isLoaded} // Desabilita enquanto busca ou se mapa/API não carregou
            title="Centralizar na minha localização"
            // Posicionamento e Estilo (Ajustados)
            className={`
              absolute bottom-5 left-5 z-10          // Canto Inferior Esquerdo
              bg-white dark:bg-gray-700 rounded-lg shadow-md // Bordas mais suaves
              p-4 text-xl                         // Padding e Tamanho do Ícone Aumentados
              text-gray-700 dark:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200          // Transição suave
            `}
        >
            {isLocating ? ( // Mostra ícone de loading enquanto busca
                <svg className="animate-spin h-5 w-5 text-brand-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : ( // Mostra ícone de alvo
                // Garanta que Font Awesome está carregado no seu index.html
                <i className="fas fa-crosshairs"></i>
            )}
        </button>

      </div>
    </main>
  );
}

export default MapPage;

