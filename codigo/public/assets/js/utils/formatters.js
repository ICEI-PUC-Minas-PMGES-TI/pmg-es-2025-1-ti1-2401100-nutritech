function formatarCPF(cpf) {
    if (!cpf) return 'Não informado';
    const cpfLimpo = String(cpf).replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return cpf;
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
