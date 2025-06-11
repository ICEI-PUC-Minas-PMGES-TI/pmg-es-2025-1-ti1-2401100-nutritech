const API_KEY = '5c44b3606f0c4083a694018d9e277792'; // Sua chave de API do Geoapify
let map;
let userLocation;
let markers = [];

// Função para carregar o arquivo JSON
async function loadOngs() {
    try {
        const response = await fetch('assets/js/adição_ONGs.json'); // Caminho para o arquivo JSON
        const ongs = await response.json(); // Converte o JSON em um array JavaScript
        initMap(ongs); // Passa as ONGs para inicializar o mapa
    } catch (error) {
        console.error("Erro ao carregar ONGs:", error);
    }
}

// Função para inicializar o mapa usando a API do Geoapify
function initMap(ongs) {
    map = new window.L.Map("map", {
        center: [-19.9191, -43.9378], // Centro de Belo Horizonte
        zoom: 12,
        zoomControl: true,
    });

    // Usando a URL fornecida para o estilo carto
    window.L.tileLayer(
        `https://maps.geoapify.com/v1/tile/carto/ {z}/{x}/{y}.png?&apiKey=${API_KEY}`,
        {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors"
        }
    ).addTo(map);

    // Definindo os ícones personalizados
    const iconDinheiro = new L.Icon({
        iconUrl: 'assets/images/iconedinheiro.png',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });
    const iconAlimento = new L.Icon({
        iconUrl: 'assets/images/iconecomida.png',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    });
    const iconVoluntario = new L.Icon({
        iconUrl: 'assets/images/iconevoluntarios.png',
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
                icon = L.icon.default; // Ícone padrão se não houver correspondência
        }
        const marker = window.L.marker([ong.lat, ong.lng], { icon })
            .addTo(map)
            .bindPopup(ong.name);
        markers.push({ ...ong, marker });
    });

    // Obtendo a localização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = [position.coords.latitude, position.coords.longitude];
            // Adicionando um marcador para a posição do usuário
            window.L.marker(userLocation)
                .addTo(map)
                .bindPopup("Sua localização");
            // Atualizar os filtros quando o mapa estiver pronto
            updateFilters();
        });
    }
}

function updateFilters() {
    const typeFilter = document.getElementById("filterType").value;
    const radius = parseFloat(document.getElementById("filterRadius").value); // Em km
    // Mostra o valor em tempo real
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
        // Filtrar pelo raio selecionado
        filteredOngs = filteredOngs.filter(ong => ong.distance <= radius);
        // 🔁 Ordenar sempre por distância (sem precisar de checkbox)
        filteredOngs.sort((a, b) => a.distance - b.distance);
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

// Função para calcular a distância entre duas coordenadas
function getDistance(coord1, coord2) {
    const lat1 = coord1[0];
    const lon1 = coord1[1];
    const lat2 = coord2[0];
    const lon2 = coord2[1];

    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Resultado em km
    return distance;
}

// Função para popular a lista de sites de ONGs
async function populateOngWebsiteList() {
    try {
        const response = await fetch('assets/js/adição_ONGs.json');
        const ongs = await response.json();
        const listContainer = document.getElementById('ong-website-list');

        if (!listContainer) {
            console.error('Element with ID "ong-website-list" not found.');
            return;
        }

        ongs.forEach(ong => {
            const listItem = document.createElement('div');
            listItem.classList.add('ong-list-item'); // Add a class for styling

            const link = document.createElement('a');
            link.href = ong.website || '#'; // Assume 'website' property in JSON, fallback to '#'
            link.textContent = ong.name;
            link.target = '_blank'; // Open in new tab
            link.classList.add('d-block', 'mb-1', 'text-decoration-none'); // Bootstrap classes for styling
            listItem.appendChild(link);
            listContainer.appendChild(listItem);
        });

    } catch (error) {
        console.error("Erro ao carregar ONGs para a lista de sites:", error);
    }
}

// Carregar as ONGs e inicializar o mapa ao carregar a página
window.onload = () => {
    loadOngs();
    populateOngWebsiteList(); // Call the new function
};

// Atualiza os filtros automaticamente enquanto o usuário arrasta o slider
document.getElementById("filterRadius").addEventListener("input", function () {
    document.getElementById("radiusValue").textContent = this.value;
    updateFilters(); // Atualiza os marcadores em tempo real
});
