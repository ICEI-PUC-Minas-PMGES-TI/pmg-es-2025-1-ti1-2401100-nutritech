const API_CONFIG = {
    PRODUCTION_URL: 'https://nutritech-platform.onrender.com',

    DEVELOPMENT_URL: 'http://localhost:3001'
};

function isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.port === '3001' ||
           window.location.port === '3000';
}

function getApiBaseUrl() {
    return isDevelopment() ? API_CONFIG.DEVELOPMENT_URL : API_CONFIG.PRODUCTION_URL;
}

function getApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl();
    console.log('[DEBUG] getApiUrl called with endpoint:', endpoint);
    console.log('[DEBUG] baseUrl:', baseUrl);
    console.log('[DEBUG] isDevelopment():', isDevelopment());
    console.log('[DEBUG] window.location.hostname:', window.location.hostname);
    console.log('[DEBUG] window.location.port:', window.location.port);
    
    if (!endpoint) {
        console.error('[ERROR] getApiUrl called with undefined/null endpoint');
        return baseUrl;
    }
    
    const finalUrl = `${baseUrl}/${endpoint}`;
    console.log('[DEBUG] final URL:', finalUrl);
    return finalUrl;
}

// Funções de formatação para exibição de dados
function formatarCPF(cpf) {
    if (!cpf) return 'Não informado';
    const cpfLimpo = String(cpf).replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return cpf;
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarCNPJ(cnpj) {
    if (!cnpj) return 'Não informado';
    const cnpjLimpo = String(cnpj).replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return cnpj;
    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function formatarTelefone(telefone) {
    if (!telefone) return 'Não informado';
    const telLimpo = String(telefone).replace(/\D/g, '');
    if (telLimpo.length < 10 || telLimpo.length > 11) return telefone;
    if (telLimpo.length === 11) {
        return telLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

function formatarCEP(cep) {
    if (!cep) return 'Não informado';
    const cepLimpo = String(cep).replace(/\D/g, '');
    if (cepLimpo.length !== 8) return cep;
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
}

function formatarData(data) {
    if (!data || data.length < 10) return 'Não informado';
    const [ano, mes, dia] = data.substring(0, 10).split('-');
    if (!ano || !mes || !dia) return data;
    return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

window.API_CONFIG = API_CONFIG;
window.getApiBaseUrl = getApiBaseUrl;
window.getApiUrl = getApiUrl;

window.formatarCPF = formatarCPF;
window.formatarCNPJ = formatarCNPJ;
window.formatarTelefone = formatarTelefone;
window.formatarCEP = formatarCEP;
window.formatarData = formatarData;
window.formatarValor = formatarValor;