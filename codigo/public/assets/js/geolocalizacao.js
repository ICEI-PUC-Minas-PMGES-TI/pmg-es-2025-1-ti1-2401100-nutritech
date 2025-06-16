const API_KEY = '5c44b3606f0c4083a694018d9e277792';
let map;
let userLocation;
let markers = [];
let userPositionMarker = null;

function formatAddress(enderecoObj) {
    if (!enderecoObj) return 'Endereço não disponível';
    return [enderecoObj.logradouro, enderecoObj.numero, enderecoObj.bairro, enderecoObj.cidade, enderecoObj.estado, enderecoObj.cep]
           .filter(part => part)
           .join(', ');
}

async function loadOngs() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'block';

    try {
        const response = await fetch('http://localhost:3001/ongs');
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status + ' ao buscar ONGs');
        }
        
        let ongsData;
        try {
            ongsData = await response.json();
        } catch (parseError) {
            console.error("Erro ao fazer parse do JSON de ONGs:", parseError);
            throw new Error("Formato de JSON inválido.");
        }

        const ongsValidas = ongsData.filter(ong => 
            ong.endereco && 
            typeof ong.endereco.lat === 'number' && 
            typeof ong.endereco.lng === 'number'
        );

        if (ongsValidas.length === 0) {
            console.warn("Nenhuma ONG com coordenadas válidas (ong.endereco.lat/lng) encontrada. Verifique o arquivo db_unificado.json ou o processo de cadastro.");
            const mapElement = document.getElementById("map");
            if (mapElement) {
                mapElement.innerHTML = '<p style="text-align: center; padding: 20px;">Nenhuma ONG com localização definida encontrada. Certifique-se de que as ONGs em db_unificado.json possuem os campos `lat` e `lng` em `endereco`.</p>';
            }
            if (loadingElement) loadingElement.style.display = 'none';
            return;
        }

        console.log("ONGs válidas carregadas:", ongsValidas);
        initMap(ongsValidas);

        if (loadingElement) loadingElement.style.display = 'none';
    } catch (error) {
        console.error("Erro ao carregar ou processar ONGs:", error);
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

function initMap(ongs) {
    const mapElement = document.getElementById("map");
    if (!mapElement) {
        console.error("Elemento do mapa com ID 'map' não encontrado.");
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.style.display = 'none';
        return;
    }

    map = new window.L.Map(mapElement, {
        center: [-19.9191, -43.9378],
        zoom: 12,
        zoomControl: true,
    });

    window.L.tileLayer(
        `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${API_KEY}`,
        {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors"
        }
    ).addTo(map);

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

    ongs.forEach((ong) => {
        if (ong.endereco && typeof ong.endereco.lat === 'number' && typeof ong.endereco.lng === 'number') {
            let iconUrl;
    
            if (ong.tipos_doacao_aceitos && ong.tipos_doacao_aceitos.includes('dinheiro')) { 
                iconUrl = 'assets/images/iconedinheiro.png';
            } else if (ong.tipos_doacao_aceitos && ong.tipos_doacao_aceitos.includes('alimentos')) { 
                iconUrl = 'assets/images/iconecomida.png';
            } else if (ong.tipos_doacao_aceitos && ong.tipos_doacao_aceitos.includes('voluntarios')) {
                iconUrl = 'assets/images/iconevoluntarios.png';
            } else {
                iconUrl = 'assets/images/default_marker.png'; 
            }

            const customIcon = new L.Icon({
                iconUrl: iconUrl,
                iconSize: [32, 40],
                iconAnchor: [16, 40],
                popupAnchor: [0, -40]
            });

            const marker = window.L.marker([ong.endereco.lat, ong.endereco.lng], { icon: customIcon }).addTo(map);
            marker.ongData = ong;
            
            const ongName = ong.nome || "Nome da ONG não disponível"; 
            const ongAddress = formatAddress(ong.endereco);
            const ongDescription = ong.descricao || "Descrição não disponível";

            marker.bindPopup(
                `<b>${ongName}</b><br>` +
                `${ongAddress}<br>` +
                `<i>${ongDescription.substring(0, 100)}${ongDescription.length > 100 ? '...' : ''}</i><br>` +
                `<a href="perfildaong.html?id=${ong.id}" target="_blank">Ver perfil</a>`
            );
            markers.push(marker);
        } else {
            console.warn('ONG ignorada por falta de coordenadas válidas:', ong);
        }
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = [position.coords.latitude, position.coords.longitude];
                console.log("Localização do usuário:", userLocation);

                if (userPositionMarker) {
                    map.removeLayer(userPositionMarker);
                }
                userPositionMarker = window.L.marker(userLocation)
                    .addTo(map)
                    .bindPopup("Você está aqui");
                
                map.setView(userLocation, 13);

                updateFilters();
            },
            (error) => {
                console.error("Erro ao obter a localização do usuário:", error);
                updateFilters();
            }
        );
    } else {
        console.warn("Geolocalização não é suportada por este navegador.");
        updateFilters();
    }
}

function getDistance(coord1, coord2) {
    const rad = (x) => (x * Math.PI) / 180;

    const d =
        12742 *
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

function updateOngListDisplay(filteredOngs) {
    const listContainer = document.getElementById('ong-website-list');
    if (!listContainer) {
        console.error("Elemento com ID 'ong-website-list' não encontrado.");
        return;
    }
    listContainer.innerHTML = '';

    if (filteredOngs.length === 0) {
        listContainer.innerHTML = '<p>Nenhuma ONG encontrada com os filtros atuais.</p>';
        return;
    }

    filteredOngs.forEach(markerObj => {
        const ongData = markerObj.ongData;
        if (!ongData) {
            console.warn("Dados da ONG não encontrados no marcador:", markerObj);
            return; 
        }

        const listItem = document.createElement('div');
        listItem.className = 'ong-list-item';
        
        const ongDisplayName = ongData.nome || "Nome não disponível";

        listItem.innerHTML = `
            <h6>${ongDisplayName}</h6>
            <a href="perfildaong.html?id=${ongData.id}" target="_blank">Ver perfil</a>
        `;
        listContainer.appendChild(listItem);
    });
}

function updateFilters() {
    console.log("updateFilters chamado");

    const typeFilter = document.getElementById("filterType").value;
    const radiusInput = document.getElementById("filterRadius").value;
    const radius = parseFloat(radiusInput);
    document.getElementById("radiusValue").textContent = radius;

    console.log('Filtros: Tipo=' + typeFilter + ', Raio=' + radius + ' km');

    let filteredOngs = [...markers]; 

    if (typeFilter !== "all") {
        filteredOngs = filteredOngs.filter(markerObj => {
            return markerObj.ongData && markerObj.ongData.tipos_doacao_aceitos && markerObj.ongData.tipos_doacao_aceitos.includes(typeFilter);
        });
        console.log('ONGs após filtro de tipo (' + typeFilter + '):', filteredOngs.length);
    }

    if (userLocation) {
        console.log("Localização do usuário disponível:", userLocation);
        filteredOngs = filteredOngs.map(markerObj => {
            if (!markerObj.ongData || !markerObj.ongData.endereco) {
                console.warn("MarkerObj sem ongData ou endereço:", markerObj);
                return { ...markerObj, distance: Infinity };
            }
            const ongCoords = [markerObj.ongData.endereco.lat, markerObj.ongData.endereco.lng];
            const distance = getDistance(userLocation, ongCoords);
            return { ...markerObj, distance: distance };
        });

        const ongsBeforeRadiusFilter = filteredOngs.length;
        filteredOngs = filteredOngs.filter(markerObj => markerObj.distance <= radius);
        console.log('ONGs antes do filtro de raio: ' + ongsBeforeRadiusFilter + ', Após filtro de raio (' + radius + ' km):', filteredOngs.length);

        filteredOngs.sort((a, b) => a.distance - b.distance);
    } else {
        console.log("Localização do usuário NÃO disponível. Pulando filtro de distância.");
    }

    markers.forEach(markerObj => {
        if (markerObj.marker && map.hasLayer(markerObj.marker)) {
            map.removeLayer(markerObj.marker);
        }
    });

    filteredOngs.forEach(ong => {
        if (ong.marker) {
            map.addLayer(ong.marker);
        }
    });
    console.log(filteredOngs.length + ' marcadores filtrados adicionados ao mapa.');

    updateOngListDisplay(filteredOngs);
}

window.onload = () => {
    loadOngs();
};

document.getElementById("filterRadius").addEventListener("input", function () {
    document.getElementById("radiusValue").textContent = this.value;
    updateFilters();
});