document.addEventListener('DOMContentLoaded', function() {
    if (!isUserLoggedIn()) {
        console.warn("Usuário não logado. Algumas funcionalidades do perfil podem não estar disponíveis.");
        document.getElementById('info-doador').innerHTML = '<p>Por favor, faça login para ver seus dados.</p>';
        document.getElementById('lista-doacoes').innerHTML = '<p>Por favor, faça login para ver suas doações.</p>';
        const fotoDoador = document.getElementById('foto-doador');
        if (fotoDoador) fotoDoador.src = 'assets/images/usuario.png';
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

            function formatarCPF(cpf) {
                if (!cpf) return 'Não informado';
                const cpfLimpo = String(cpf).replace(/\D/g, '');
                if (cpfLimpo.length !== 11) return cpf;
                return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            }

            function formatarTelefone(telefone) {
                if (!telefone) return 'Não informado';
                const telLimpo = String(telefone).replace(/\D/g, '');
                if (telLimpo.length !== 11) return telefone;
                return telLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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

            info.innerHTML = `
              <div class="card-pessoal">
                <strong>Nome:</strong> ${nomeStr}<br>
                <strong>Email:</strong> ${emailStr}<br>
                <strong>Data de Nascimento:</strong> ${formatarData(dataNascimentoStr)}<br>
                <strong>Endereço:</strong> ${enderecoCompletoStr}<br>
                <strong>Cidade:</strong> ${cidadeStr}<br>
                <strong>Estado:</strong> ${estadoStr}<br>
                <strong>CEP:</strong> ${formatarCEP(cepStr)}<br>
                <strong>Telefone:</strong> ${formatarTelefone(telefoneStr)}<br>
                <strong>CPF:</strong> ${formatarCPF(cpfStr)}<br>
              </div>
            `;
            const lista = document.getElementById('lista-doacoes');
            lista.innerHTML = '';
            if (userData.doacoes && userData.doacoes.length > 0) {
                userData.doacoes.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'card mb-3 shadow rounded-4';
                    
                    let categoria = 'Alimento';
                    if (item.categoria && typeof item.categoria === 'string') { 
                        categoria = item.categoria;
                    }

                    let recipientInfo = '';
                    if (item.recipientOngNome) {
                        recipientInfo = `<strong>Para:</strong> ${item.recipientOngNome}<br>`;
                    }

                    let categorySpecificInfo = '';
                    if (categoria === 'Dinheiro') {
                        categorySpecificInfo = `
                        <strong>Recorrência:</strong> ${item.recorrencia === true ? 'Sim' : item.recorrencia === false ? 'Não' : 'Não informado'}<br>
                        <strong>Comprovante:</strong> <a href="${item.comprovante || '#'}" target="_blank">Ver Comprovante</a><br>
                        `;
                    } else {
                        categorySpecificInfo = `
                        <strong>Quantidade:</strong> ${item.quantidade || 'N/A'}<br>
                        `;
                    }

                    card.innerHTML = `
                        <div class="card-body rounded-pill">
                            <h5 class="card-title">
                                Doação de ${item.descricao || 'N/A'} <!-- Nome da Doação -->
                            </h5>
                            <p class="card-text">
                            ${recipientInfo}
                            <strong>Data:</strong> ${formatarData(item.data)}<br>
                            <strong>Categoria:</strong> ${categoria}<br>
                            <strong>Valor Estimado:</strong> R$ ${(parseFloat(item.valor) || 0).toFixed(2)}<br>
                            ${categorySpecificInfo}
                            <strong>Status:</strong> ${item.status || 'Concluído'}<br>
                            </p>
                            <button class="btn btn-doar-novamente btn-verde rounded-pill justify-content-center align-items-center" data-doacao='${JSON.stringify(item)}'>
                            Doar novamente para ${item.recipientOngNome || 'esta causa'}
                            </button>
                        </div>
                        `;
                    lista.appendChild(card);
                });
            } else {
                lista.innerHTML = '<p>Nenhuma doação encontrada.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados do usuário:', error);
            document.getElementById('info-doador').innerHTML = `<p>${error.message}</p>`;
            document.getElementById('lista-doacoes').innerHTML = '<p>Não foi possível carregar as doações.</p>';
        });

    const gerenciarRecorrenciaButton = document.getElementById('gerenciar-recorrencia');
    if (gerenciarRecorrenciaButton) {
        gerenciarRecorrenciaButton.addEventListener('click', function() {
            window.location.href = 'gerenciar_recorrencias.html';
        });
    }

    const novaDoacaoButton = document.getElementById('nova-doacao');
    if (novaDoacaoButton) {
        novaDoacaoButton.addEventListener('click', function() {
            window.location.href = 'cadastro_doacao.html';
        });
    }

    const editarButton = document.getElementById('editar');
    if (editarButton) {
        editarButton.addEventListener('click', function() {
            // Futuramente, pode levar a uma página de edição de perfil
            alert('Funcionalidade de edição a ser implementada.');
        });
    }

    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            sessionStorage.removeItem('usuarioCorrente');
            window.location.href = 'login.html';
        });
    }
});

