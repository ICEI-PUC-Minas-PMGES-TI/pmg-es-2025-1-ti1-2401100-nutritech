const API_KEY = '5c44b3606f0c4083a694018d9e277792'; // Chave de API do Geoapify
let map;
let userLocation;
let markers = [];

// Função para carregar o arquivo JSON
// Função para carregar o arquivo JSON
async function loadOngs() {
    try {
        // Mostra o indicador de carregamento
        document.getElementById('loading').style.display = 'block';

        const response = await fetch('adição_ONGs.json'); // Caminho para o arquivo JSON
        if (!response.ok) {
            throw new Error(`Erro ao carregar JSON: ${response.status}`);
        }
        const ongs = await response.json(); // Converte o JSON em um array JavaScript

        // Adicionar coordenadas às ONGs usando geocodificação com atraso
        const ongsComCoordenadas = [];
        for (const ong of ongs) {
            const enderecoCompleto = `${ong.endereco}, ${ong.cidade}, ${ong.estado}`;
            const coordenadas = await geocodeAddress(enderecoCompleto);
            ongsComCoordenadas.push({ ...ong, lat: coordenadas?.lat, lng: coordenadas?.lng });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Atraso de 1 segundo
        }

        // Filtrar apenas as ONGs com coordenadas válidas
        const ongsValidas = ongsComCoordenadas.filter(ong => ong.lat && ong.lng);
        console.log("ONGs com coordenadas válidas:", ongsValidas); // Debug

        if (ongsValidas.length === 0) {
            console.error("Nenhuma ONG com coordenadas válidas encontrada.");
            return;
        }

        // Inicializar o mapa com as ONGs que têm coordenadas
        initMap(ongsValidas);

        // Oculta o indicador de carregamento
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error("Erro ao carregar ou processar ONGs:", error);
        // Oculta o indicador de carregamento em caso de erro
        document.getElementById('loading').style.display = 'none';
    }
}

// Função para inicializar o mapa
function initMap(ongs) {
    map = new window.L.Map("map", {
        center: [-19.9191, -43.9378], // Centro de Belo Horizonte
        zoom: 12,
        zoomControl: true,
    });

    // Usando a URL fornecida para o estilo carto
    window.L.tileLayer(
        `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${API_KEY}`, // Corrigido espaço na URL
        {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors"
        }
    ).addTo(map);

    // Definindo os ícones personalizados
    const iconDinheiro = new L.Icon({
        iconUrl: 'imgs/iconedinheiro.png',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });
    const iconAlimento = new L.Icon({
        iconUrl: 'imgs/iconecomida.png',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });
    const iconVoluntario = new L.Icon({
        iconUrl: 'imgs/iconevoluntarios.png',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });

    // Adicionando os marcadores para as ONGs com ícones personalizados
    ongs.forEach((ong) => {
        let icon;
        switch (ong.tipo) {
            case 'dinheiro':
                icon = iconDinheiro;
                break;
            case 'alimentos':
                icon = iconAlimento;
                break;
            case 'voluntariado':
                icon = iconVoluntario;
                break;
            default:
                icon = L.icon.default(); // Ícone padrão se não houver correspondência
        }

        const marker = window.L.marker([ong.lat, ong.lng], { icon })
            .addTo(map)
            .bindPopup(`${ong.name}<br>${ong.endereco}`);
        markers.push({ ...ong, marker });
    });

    // Obtendo a localização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = [position.coords.latitude, position.coords.longitude];
                console.log("Localização do usuário:", userLocation);

                // Adicionando um marcador para a posição do usuário
                const userMarker = window.L.marker(userLocation)
                    .addTo(map)
                    .bindPopup("Sua localização");
                markers.push({ tipo: "usuario", marker: userMarker });

                // Centralizar o mapa no usuário
                map.setView(userLocation, 12);

                // Atualizar os filtros quando o mapa estiver pronto
                updateFilters();
            },
            (error) => {
                console.error("Erro na geolocalização:", error);
            }
        );
    }
}

// Função para calcular a distância entre duas coordenadas
function getDistance(coord1, coord2) {
    const R = 6371; // Raio da Terra em km
    const lat1 = coord1[0] * Math.PI / 180;
    const lon1 = coord1[1] * Math.PI / 180;
    const lat2 = coord2[0] * Math.PI / 180;
    const lon2 = coord2[1] * Math.PI / 180;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Resultado em km
}

// Função para atualizar os filtros
function updateFilters() {
    const typeFilter = document.getElementById("filterType").value;
    const radius = parseFloat(document.getElementById("filterRadius").value); // Em km
    document.getElementById("radiusValue").textContent = radius;

    let filteredOngs = [...markers]; // Cria cópia dos marcadores

    // Filtrar por tipo de ONG
    if (typeFilter !== "all") {
        filteredOngs = filteredOngs.filter(ong => ong.tipo === typeFilter);
    }

    // Se tiver localização do usuário, filtrar por distância
    if (userLocation) {
        filteredOngs = filteredOngs.map(ong => ({
            ...ong,
            distance: getDistance(userLocation, [ong.lat, ong.lng])
        }));
        filteredOngs = filteredOngs.filter(ong => ong.distance <= radius);
        filteredOngs.sort((a, b) => a.distance - b.distance); // Ordena por distância
    }

    // Remover todos os marcadores do mapa
    markers.forEach(markerObj => {
        map.removeLayer(markerObj.marker);
    });

    // Adicionar apenas os marcadores filtrados
    filteredOngs.forEach(ong => {
        map.addLayer(ong.marker);
    });

    // Garantir que o pin do usuário sempre fique visível
    const userMarker = markers.find(m => m.tipo === "usuario")?.marker;
    if (userMarker && !map.hasLayer(userMarker)) {
        map.addLayer(userMarker);
    }
}

// Função para geocodificar endereços usando Nominatim
async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
            console.log("Coordenadas encontradas para:", address, data[0]);
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        } else {
            console.error("Endereço não encontrado:", address);
            return null;
        }
    } catch (error) {
        console.error("Erro ao geocodificar o endereço:", address, error);
        return null;
    }
}

// Carregar as ONGs e inicializar o mapa ao carregar a página
window.onload = loadOngs;

// Atualiza os filtros automaticamente enquanto o usuário arrasta o slider
document.getElementById("filterRadius").addEventListener("input", function () {
    document.getElementById("radiusValue").textContent = this.value;
    updateFilters(); // Atualiza os marcadores em tempo real
});