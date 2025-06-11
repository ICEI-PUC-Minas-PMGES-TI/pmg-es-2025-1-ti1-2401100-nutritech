const API_KEY = '5c44b3606f0c4083a694018d9e277792'; // Sua chave de API do Geoapify
let map;
let userLocation;
let markers = [];
let userPositionMarker = null; // Variable to store the user's location marker

// Função para carregar o arquivo JSON
async function loadOngs() {
    const loadingElement = document.getElementById('loading');
    try {
        const response = await fetch('assets/js/adição_ONGs.json'); // Corrected path
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ao buscar adição_ONGs.json`);
        }
        let ongs;
        try {
            ongs = await response.json();
        } catch (parseError) {
            console.error("Erro ao fazer parse do JSON de ONGs:", parseError);
            throw new Error("Formato de JSON inválido.");
        }

        const ongsValidas = ongs.filter(ong => typeof ong.lat === 'number' && typeof ong.lng === 'number');

        if (ongsValidas.length === 0) {
            console.error("Nenhuma ONG com coordenadas válidas encontrada diretamente no JSON.");
            if (loadingElement) loadingElement.style.display = 'none';
            return;
        }

        console.log("ONGs válidas carregadas do JSON:", ongsValidas);
        initMap(ongsValidas);

        if (loadingElement) loadingElement.style.display = 'none';
    } catch (error) {
        console.error("Erro ao carregar ou processar ONGs:", error);
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

// Função para inicializar o mapa
function initMap(ongs) {
    const mapElement = document.getElementById("map");
    if (!mapElement) {
        console.error("Elemento do mapa com ID 'map' não encontrado.");
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.style.display = 'none';
        return;
    }

    map = new window.L.Map(mapElement, {
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
                icon = iconDinheiro; // Correctly assign icon
                break;
            case 'alimentos':
                icon = iconAlimento; // Correctly assign icon
                break;
            case 'voluntariado':
                icon = iconVoluntario; // Correctly assign icon
                break;
            default:
                // Ensure L.Icon.Default is available or fallback to undefined for Leaflet's internal default
                icon = window.L.Icon.Default ? new window.L.Icon.Default() : undefined;
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

                // Remove o marcador anterior do usuário, se existir
                if (userPositionMarker) {
                    map.removeLayer(userPositionMarker);
                }
                // Adiciona um novo marcador para a localização do usuário
                userPositionMarker = window.L.marker(userLocation)
                    .addTo(map)
                    .bindPopup("Você está aqui");
                
                // Centraliza o mapa na localização do usuário
                map.setView(userLocation, 13);

                updateFilters(); // Atualiza os filtros após obter a localização do usuário
            },
            (error) => {
                console.error("Erro ao obter a localização do usuário:", error);
                updateFilters(); // Mesmo com erro na geolocalização, os filtros podem ser aplicados sem o raio
            }
        );
    } else {
        console.warn("Geolocalização não é suportada por este navegador.");
        updateFilters(); // Atualiza os filtros sem informações de localização do usuário
    }
}

// Função para calcular a distância entre duas coordenadas
function getDistance(coord1, coord2) {
    const rad = (x) => (x * Math.PI) / 180;

    const d =
        12742 * // Raio da Terra em quilômetros
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin(rad((coord2[0] - coord1[0]) / 2)), 2) +
                Math.cos(rad(coord1[0])) *
                Math.cos(rad(coord2[0])) *
                Math.pow(Math.sin(rad((coord2[1] - coord1[1]) / 2)), 2)
            )
        );

    return d;
}

// Function to update the displayed list of ONGs based on current filters
function updateOngListDisplay(filteredOngs) {
    const listContainer = document.getElementById('ong-website-list');
    if (!listContainer) {
        console.error("Elemento com ID 'ong-website-list' não encontrado.");
        return;
    }
    listContainer.innerHTML = ''; // Clear the list before populating

    if (filteredOngs.length === 0) {
        listContainer.innerHTML = '<p>Nenhuma ONG encontrada com os filtros atuais.</p>';
        return;
    }

    filteredOngs.forEach(ong => {
        const listItem = document.createElement('div');
        listItem.classList.add('ong-list-item');

        const link = document.createElement('a');
        link.href = ong.website || '#';
        link.textContent = ong.name;
        link.target = "_blank";

        listItem.appendChild(link);

        if (ong.distance !== undefined) {
            const distanceText = document.createElement('span');
            distanceText.textContent = ` - ${ong.distance.toFixed(2)} km`;
            listItem.appendChild(distanceText);
        }
        listContainer.appendChild(listItem);
    });
}

// Função para atualizar os filtros
function updateFilters() {
    console.log("updateFilters chamado"); // Log start of function

    const typeFilter = document.getElementById("filterType").value;
    const radiusInput = document.getElementById("filterRadius").value;
    const radius = parseFloat(radiusInput); // Em km
    document.getElementById("radiusValue").textContent = radius;

    console.log(`Filtros: Tipo=${typeFilter}, Raio=${radius} km`); // Log filter values

    let filteredOngs = [...markers]; // Creates a copy of markers

    // Filter by ONG type
    if (typeFilter !== "all") {
        filteredOngs = filteredOngs.filter(ong => ong.tipo === typeFilter);
        console.log(`ONGs após filtro de tipo (${typeFilter}):`, filteredOngs.length);
    }

    // If user location is available, filter by distance
    if (userLocation) {
        console.log("Localização do usuário disponível:", userLocation);
        filteredOngs = filteredOngs.map(ong => {
            const distance = getDistance(userLocation, [ong.lat, ong.lng]);
            // console.log(`ONG: ${ong.name}, Coords: [${ong.lat}, ${ong.lng}], Distância: ${distance.toFixed(2)} km`);
            return {
                ...ong,
                distance: distance
            };
        });

        // Filter by radius
        const ongsBeforeRadiusFilter = filteredOngs.length;
        filteredOngs = filteredOngs.filter(ong => {
            const isInRadius = ong.distance <= radius;
            // if (!isInRadius) {
            //     console.log(`ONG ${ong.name} (${ong.distance.toFixed(2)} km) fora do raio de ${radius} km.`);
            // }
            return isInRadius;
        });
        console.log(`ONGs antes do filtro de raio: ${ongsBeforeRadiusFilter}, Após filtro de raio (${radius} km):`, filteredOngs.length);


        filteredOngs.sort((a, b) => a.distance - b.distance); // Sort by distance
        // console.log("ONGs ordenadas por distância:", filteredOngs.map(o => `${o.name} (${o.distance.toFixed(2)} km)`));
    } else {
        console.log("Localização do usuário NÃO disponível. Pulando filtro de distância.");
    }

    // Remove all markers from the map
    markers.forEach(markerObj => {
        if (markerObj.marker && map.hasLayer(markerObj.marker)) {
            map.removeLayer(markerObj.marker);
        }
    });
    // console.log("Todos os marcadores removidos do mapa.");

    // Add only the filtered markers
    filteredOngs.forEach(ong => {
        if (ong.marker) { // Ensure marker exists
            map.addLayer(ong.marker);
        }
    });
    console.log(`${filteredOngs.length} marcadores filtrados adicionados ao mapa.`);

    // Update the list of ONGs displayed
    updateOngListDisplay(filteredOngs); // Call the new function to update the list
}

// Carregar as ONGs e inicializar o mapa ao carregar a página
window.onload = () => {
    loadOngs();
    // populateOngWebsiteList(); // REMOVED - Handled by updateFilters
};

// Atualiza os filtros automaticamente enquanto o usuário arrasta o slider
document.getElementById("filterRadius").addEventListener("input", function () {
    document.getElementById("radiusValue").textContent = this.value;
    updateFilters(); // Atualiza os marcadores em tempo real
});