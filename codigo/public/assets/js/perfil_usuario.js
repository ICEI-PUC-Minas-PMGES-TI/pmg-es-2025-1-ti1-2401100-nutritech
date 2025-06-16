document.addEventListener('DOMContentLoaded', function() {
    if (!isUserLoggedIn()) {
        console.warn("Usuário não logado. Algumas funcionalidades do perfil podem não estar disponíveis.");
        document.getElementById('info-doador').innerHTML = '<p>Por favor, faça login para ver seus dados.</p>';
        document.getElementById('lista-doacoes').innerHTML = '<p>Por favor, faça login para ver suas doações.</p>';
        const fotoDoador = document.getElementById('foto-doador');
        if (fotoDoador) fotoDoador.src = '/public/assets/images/usuario.png';
        const nomeUsuarioH1 = document.querySelector('.d-flex.justify-content-center.align-items-center.flex-column.mb-4 h1');
        if (nomeUsuarioH1) nomeUsuarioH1.textContent = 'Usuário Anônimo';
        return;
    }
    const currentUser = usuarioCorrente;
    const fotoDoador = document.getElementById('foto-doador');
    if (fotoDoador && currentUser.fotoPerfil) {
        fotoDoador.src = currentUser.fotoPerfil;
    }
    const nomeUsuarioH1 = document.querySelector('.d-flex.justify-content-center.align-items-center.flex-column.mb-4 h1');
    if (nomeUsuarioH1 && currentUser.nome) {
        nomeUsuarioH1.textContent = currentUser.nome;
    }
    const userId = currentUser.id; 
    if (typeof window.API_URL === 'undefined' || !userId) {
        console.error("API_URL on window or userId is not defined. Aborting fetch.");
        document.getElementById('info-doador').innerHTML = '<p>Erro de configuração: Não foi possível carregar os dados do perfil.</p>';
        document.getElementById('lista-doacoes').innerHTML = '<p>Erro de configuração: Não foi possível carregar as doações.</p>';
        return;
    }
    fetch(`${window.API_URL}/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Falha ao carregar dados do usuário. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(userData => {
            const info = document.getElementById('info-doador');
            let nomeStr = userData.nome || 'Não informado';
            let emailStr = userData.email || 'Não informado';
            let dataNascimentoStr = userData.dataNascimento || 'Não informado';
            let telefoneStr = userData.telefone || 'Não informado';
            let cpfStr = userData.cpf || 'Não informado';
            let enderecoCompletoStr = 'Não informado';
            let cidadeStr = 'Não informado';
            let estadoStr = 'Não informado';
            let cepStr = 'Não informado';
            if (userData.endereco) {
                const { logradouro, numero, bairro, cidade, estado, cep } = userData.endereco;
                let enderecoPartes = [];
                if (logradouro) enderecoPartes.push(logradouro);
                if (numero) enderecoPartes.push(numero);
                let logradouroNumero = enderecoPartes.join(', ');
                if (logradouroNumero && bairro) {
                    enderecoCompletoStr = `${logradouroNumero} - ${bairro}`;
                } else if (logradouroNumero) {
                    enderecoCompletoStr = logradouroNumero;
                } else if (bairro) {
                    enderecoCompletoStr = bairro;
                }
                if (cidade) cidadeStr = cidade;
                if (estado) estadoStr = estado;
                if (cep) cepStr = cep;
            }
            info.innerHTML = `
              <div class="card-pessoal">
                <strong>Nome:</strong> ${nomeStr}<br>
                <strong>Email:</strong> ${emailStr}<br>
                <strong>Data de Nascimento:</strong> ${dataNascimentoStr}<br>
                <strong>Endereço:</strong> ${enderecoCompletoStr}<br>
                <strong>Cidade:</strong> ${cidadeStr}<br>
                <strong>Estado:</strong> ${estadoStr}<br>
                <strong>CEP:</strong> ${cepStr}<br>
                <strong>Telefone:</strong> ${telefoneStr}<br>
                <strong>CPF:</strong> ${cpfStr}<br>
              </div>
            `;
            const lista = document.getElementById('lista-doacoes');
            lista.innerHTML = '';
            if (userData.doacoes && userData.doacoes.length > 0) {
                userData.doacoes.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'card mb-3 shadow rounded-4';
                    const infoDinheiro = `
                    <strong>Recorrência:</strong> ${item.recorrencia === true ? 'Sim' : item.recorrencia === false ? 'Não' : 'Não informado'}<br>
                    <strong>Comprovante:</strong> <a href="${item.comprovante || '#'}" target="_blank">Ver Comprovante</a><br>
                    `;
                    const infoOutros = `
                    <strong>Quantidade:</strong> ${item.quantidade}<br>
                    <strong>Entrega:</strong> ${item.entrega || 'Não informado'}<br>
                    `;
                    card.innerHTML = `
                        <div class="card-body rounded-pill">
                            <h5 class="card-title">
                            <a href="#" class="text-decoration-none">
                                ${item.instituicao || 'Nome da Instituição não disponível'}
                            </a>
                            </h5>
                            <p class="card-text">
                            <strong>Data:</strong> ${item.data}<br>
                            <strong>Descrição:</strong> ${item.descricao}<br>
                            <strong>Categoria:</strong> ${item.categoria}<br>
                            <strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2)}<br>
                            ${item.categoria === 'Dinheiro' ? infoDinheiro : infoOutros}
                            <strong>Status:</strong> ${item.status || 'Concluído'}<br>
                            </p>
                            <button class="btn btn-doar-novamente btn-verde rounded-pill justify-content-center align-items-center" data-doacao='${JSON.stringify(item)}'>
                            Doar novamente
                            </button>
                        </div>
                        `;
                    lista.appendChild(card);
                });
            } else {
                lista.innerHTML = '<p>Nenhuma doação encontrada para este usuário.</p>';
            }
        })
        .catch(error => {
            console.error('Erro detalhado ao carregar dados do usuário ou doações:', error);
            document.getElementById('info-doador').innerHTML = '<p>Erro ao carregar dados pessoais. Verifique o console.</p>';
            document.getElementById('lista-doacoes').innerHTML = '<p>Erro ao carregar doações. Verifique o console.</p>';
        });
});
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-doar-novamente')) {
      const doacao = JSON.parse(e.target.getAttribute('data-doacao'));
      alert(`Você está doando: ${doacao.descricao} para ${doacao.instituicao || 'a instituição'}`);
    }
});
document.getElementById('gerenciar-recorrencia').addEventListener('click', function () {
    if (!isUserLoggedIn()) {
        alert("Por favor, faça login para gerenciar suas doações recorrentes.");
        redirectToLogin();
        return;
    }
    window.location.href = '/public/larissa_moncao/public/gerenciar_recorrencia/gerenciar_recorrencias.html';  
});
const editarButton = document.getElementById('editar');
if(editarButton) {
    editarButton.addEventListener('click', function() {
        if (!isUserLoggedIn()) {
            alert("Por favor, faça login para editar seus dados.");
            redirectToLogin();
            return;
        }
        alert("Funcionalidade de edição de perfil ainda não implementada.");
    });
}
const logoutButton = document.getElementById('logout');
if(logoutButton) {
    logoutButton.addEventListener('click', function() {
        if (typeof logout === "function") {
            logout(); 
        } else {
            console.warn("Função de logout não encontrada globalmente. O logout principal é pelo header.");
            sessionStorage.removeItem('usuarioCorrente');
            window.location.href = RETURN_URL; 
        }
    });
}
const novaDoacaoButton = document.getElementById('nova-doacao');
if(novaDoacaoButton) {
    novaDoacaoButton.addEventListener('click', function() {
        if (!isUserLoggedIn()) {
            alert("Por favor, faça login para fazer uma nova doação.");
            redirectToLogin();
            return;
        }
        window.location.href = '/public/cadastro_doacao.html';
    });
}

