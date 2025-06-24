function getOngId() {
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        try {
            const usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
            if (usuarioCorrente && usuarioCorrente.type === 'ong' && usuarioCorrente.id) {
                return usuarioCorrente.id;
            }
        } catch (e) {
            console.error("Error parsing usuarioCorrente from sessionStorage:", e);
        }
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 1;
}
const ongId = getOngId();
const ONGS_API_URL_BASE = 'http://localhost:3001/ongs';
fetch(`${ONGS_API_URL_BASE}/${ongId}`)
  .then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    function formatarData(data) {
        if (!data) return 'Não informado';
        const dataObj = new Date(data);
        if (isNaN(dataObj.getTime())) {
            return data; 
        }
        dataObj.setDate(dataObj.getDate() + 1);
        const dia = String(dataObj.getDate()).padStart(2, '0');
        const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
        const ano = dataObj.getFullYear();
        return `${dia}/${mes}/${ano}`;
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
        if (telLimpo.length === 11) {
            return telLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (telLimpo.length === 10) {
            return telLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return telefone;
    }

    document.getElementById('nomeONG').textContent = data.nome || 'Nome não disponível';
    document.getElementById('nomeONGCard').textContent = data.nome || 'Nome não disponível';
    document.getElementById('entrouEm').textContent = formatarData(data.data_entrada);
    document.getElementById('cnpj').textContent = formatarCNPJ(data.cnpj);
    document.getElementById('contato').textContent = formatarTelefone(data.contato.telefone);
    document.getElementById('fundadaEm').textContent = formatarData(data.data_fundacao);
    document.getElementById('familiasAjudadas').textContent = data.familias_ajudadas || 'N/A';
    document.getElementById('voluntarios').textContent = data.voluntarios_necessarios || 'N/A';
    document.getElementById('colaboradoresMensais').textContent = data.colaboradores_mensais || 'N/A';
    document.getElementById('descricao').textContent = data.descricao || 'Descrição não disponível';
    document.getElementById('cidade').textContent = data.endereco ? data.endereco.cidade : 'Cidade não disponível';
    document.getElementById('telefone').textContent = formatarTelefone(data.telefone);
    document.getElementById('email').textContent = data.email || 'Email não disponível';
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    let isOwner = false;
    let isUser = false;
    if (usuarioCorrenteJSON) {
        try {
            const usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
            if (usuarioCorrente && usuarioCorrente.type === 'ong' && usuarioCorrente.id.toString() === ongId.toString()) {
                isOwner = true;
            } else if (usuarioCorrente && usuarioCorrente.type === 'user') {
                isUser = true;
            }
        } catch (e) {
            console.error("Error parsing usuarioCorrente from sessionStorage for button update:", e);
        }
    }
    const primaryButton = document.getElementById('primaryActionButton');
    const secondaryButton = document.getElementById('secondaryActionButton');
    const tertiaryButton = document.getElementById('tertiaryActionButton');

    if (isOwner) {
        if (primaryButton) {
            primaryButton.textContent = 'Editar Perfil';
            primaryButton.onclick = function() {
                window.location.href = `/public/editar_perfil_ong.html?id=${ongId}`;
            };
        }
        if (secondaryButton) {
            secondaryButton.textContent = 'Dashboard da ONG';
            secondaryButton.onclick = function() {
                window.location.href = `/public/dashboard_ong.html?id=${ongId}`;
            };
        }
    } else if (isUser) {
        if (primaryButton) {
            primaryButton.textContent = 'Doar Dinheiro';
            primaryButton.onclick = function() {
                window.location.href = `cartao.html?ongId=${ongId}`;
            };
        }
        if (secondaryButton) {
            secondaryButton.textContent = 'Doar Alimento';
            secondaryButton.onclick = function() {
                window.location.href = `cadastro_doacao.html?ongId=${ongId}`;
            };
        }
        if (tertiaryButton) {
            tertiaryButton.style.display = 'inline-block'; // Mostra o botão
            tertiaryButton.textContent = 'Agendar Coleta de Alimentos';
            tertiaryButton.onclick = function() {
                window.location.href = `agendamento.html?ongId=${ongId}`;
            };
        }
    } else {
        if (primaryButton) {
            primaryButton.textContent = 'Doar Dinheiro'; 
            primaryButton.onclick = function() {
                alert('Você precisa estar logado para doar dinheiro.');
            };
        }
        if (secondaryButton) {
            secondaryButton.textContent = 'Doar Alimento';
            secondaryButton.onclick = function() {
                window.location.href = `cadastro_doacao.html?ongId=${ongId}`;
            };
        }
    }
    const imgElement = document.getElementById('ongProfilePic');
    if (imgElement && data.imagem) {
      imgElement.src = data.imagem;
    } else if (imgElement) {
      imgElement.src = 'assets/images/default_ong_logo.png';
    }
  })
  .catch(error => {
    console.error("Erro ao carregar dados da ONG:", error);
    const errorDisplay = document.getElementById('errorDisplay');
    if (errorDisplay) {
        errorDisplay.textContent = "Erro ao carregar dados da ONG. Verifique o console para mais detalhes.";
    } else {
        alert("Erro ao carregar dados da ONG. Verifique o console para mais detalhes.");
    }
  });

