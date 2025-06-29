
const API_CONFIG = {
    PRODUCTION_URL: 'https://nutritech-platform.onrender.com',
    
    // URL local para desenvolvimento
    DEVELOPMENT_URL: 'http://localhost:3001'
};

function isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.port === '3001';
}

function getApiBaseUrl() {
    return isDevelopment() ? API_CONFIG.DEVELOPMENT_URL : API_CONFIG.PRODUCTION_URL;
}

function getApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/${endpoint}`;
}

window.API_CONFIG = API_CONFIG;
window.getApiBaseUrl = getApiBaseUrl;
window.getApiUrl = getApiUrl;