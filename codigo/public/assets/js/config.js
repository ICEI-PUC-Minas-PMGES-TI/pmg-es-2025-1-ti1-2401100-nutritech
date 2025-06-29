
(function() {
    'use strict';
    
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const baseURL = isProduction ? window.location.origin : 'http://localhost:3001';
    
    window.API_CONFIG = {
        BASE_URL: baseURL,
        USUARIOS_URL: `${baseURL}/usuarios`,
        ONGS_URL: `${baseURL}/ongs`,
        ALIMENTOS_URL: `${baseURL}/alimentos`,
        DOACOES_URL: `${baseURL}/doacoes`,
        VOLUNTARIOS_URL: `${baseURL}/voluntarios`
    };
    
    window.API_URL = window.API_CONFIG.USUARIOS_URL;
    window.ONGS_API_URL = window.API_CONFIG.ONGS_URL;
    
    console.log('API Config loaded:', window.API_CONFIG);
})();
