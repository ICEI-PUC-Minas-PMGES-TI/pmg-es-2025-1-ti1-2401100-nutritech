document.addEventListener('DOMContentLoaded', async function() {

    function isUserLoggedIn() {
        return sessionStorage.getItem('currentUser') !== null || localStorage.getItem('currentUser') !== null;
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


    if (!isUserLoggedIn()) {
        console.warn("Usuário não logado. Redirecionando para login.");
        window.location.href = '../login/login.html';
        return;
    }

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
    const userId = currentUser.id;

    try {
        const [userResponse, alimentosResponse, ongsResponse] = await Promise.all([
            fetch(window.getApiUrl(`usuarios/${userId}`)),
            fetch(window.getApiUrl(`alimentos?usuarioId=${userId}`)),
            fetch(window.getApiUrl(`ongs`))
        ]);

        if (!userResponse.ok) throw new Error(`Falha ao carregar dados do usuário. Status: ${userResponse.status}`);
        
        const userData = await userResponse.json();

        // Popula o cabeçalho do perfil com dados atualizados
        const fotoDoador = document.getElementById('foto-doador');
        if (fotoDoador) {
            fotoDoador.src = userData.fotoPerfil || 'assets/images/usuario.png';
        }
        
        const nomeDisplay = document.querySelector('.d-flex.justify-content-center.align-items-center.flex-column.mb-4 h1');
        if (nomeDisplay) {
            nomeDisplay.textContent = userData.nome || 'Usuário';
        }

        const alimentosData = alimentosResponse.ok ? await alimentosResponse.json() : [];
        const ongsData = ongsResponse.ok ? await ongsResponse.json() : [];
        const ongsMap = new Map(ongsData.map(ong => [ong.id, ong.nome]));

        const infoDoadorEl = document.getElementById('info-doador');
        const { nome, email, dataNascimento, endereco, telefone, cpf } = userData;
        let enderecoCompletoStr = 'Não informado';
        if (endereco) {
            const { logradouro, numero, bairro } = endereco;
            enderecoCompletoStr = `${logradouro || ''}, ${numero || ''} - ${bairro || ''}`;
        }
        infoDoadorEl.innerHTML = `
          <div class="card-pessoal">
            <strong>Nome:</strong> ${nome || 'Não informado'}<br>
            <strong>Email:</strong> ${email || 'Não informado'}<br>
            <strong>Data de Nascimento:</strong> ${formatarData(dataNascimento)}<br>
            <strong>Endereço:</strong> ${enderecoCompletoStr}<br>
            <strong>Cidade:</strong> ${endereco ? endereco.cidade : 'Não informado'}<br>
            <strong>Estado:</strong> ${endereco ? endereco.estado : 'Não informado'}<br>
            <strong>CEP:</strong> ${formatarCEP(endereco?.cep)}<br>
            <strong>Telefone:</strong> ${formatarTelefone(telefone)}<br>
            <strong>CPF:</strong> ${formatarCPF(cpf)}<br>
          </div>
        `;


        const doacoesDinheiro = (userData.doacoes || []).filter(d => d.descricao && d.descricao.toLowerCase() === 'dinheiro');


        const todasDoacoes = [...doacoesDinheiro, ...alimentosData];
        todasDoacoes.sort((a, b) => {
            const dateA = new Date(a.data || a.data_registro);
            const dateB = new Date(b.data || b.data_registro);
            return dateB - dateA;
        });

        const listaDoacoesEl = document.getElementById('lista-doacoes');
        listaDoacoesEl.innerHTML = '';

        if (todasDoacoes.length > 0) {
            todasDoacoes.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card mb-3 shadow rounded-4';

                const isDinheiro = item.descricao && item.descricao.toLowerCase() === 'dinheiro';
                const categoria = isDinheiro ? 'Dinheiro' : 'Alimento';
                const ongId = item.agendamento?.ongId || item.recipientOngId || item.ongId;
                const ongNome = item.agendamento?.ongNome || item.recipientOngNome || ongsMap.get(ongId);
                const dataRegistro = item.data || item.data_registro;

                let recipientInfo = ongNome ? `<strong>Para:</strong> ${ongNome}<br>` : '';
                let categorySpecificInfo = '';
                let statusInfo = '';
                let actionButtons = '';

                if (isDinheiro) {
                    categorySpecificInfo = `<strong>Recorrência:</strong> ${item.recorrencia ? 'Sim' : 'Não'}<br>`;
                    statusInfo = `<strong>Status:</strong> Concluído<br>`;
                } else { 
                    categorySpecificInfo = `<strong>Quantidade:</strong> ${item.quantidade || 'N/A'}<br>`;
                    const status = item.status || 'Pendente';
                    statusInfo = `<strong>Status:</strong> ${status}<br>`;
                    
                    if (status === 'Agendado' && item.agendamento) {
                        statusInfo += `<small class="text-muted">Coleta agendada para ${formatarData(item.agendamento.dataColeta)} com ${item.agendamento.voluntarioNome}.</small><br>`;
                    }

                    if (ongId) {
                        if (status === 'Pendente') {
                            actionButtons = `
                                <a href="agendamento.html?ongId=${ongId}&doacaoId=${item.id}" class="btn btn-sm btn-success">Agendar Coleta</a>
                                <button class="btn btn-sm btn-danger ms-2 btn-excluir-doacao" data-doacao-id="${item.id}">Excluir Doação</button>
                            `;
                        } else if (status === 'Agendado') {
                            actionButtons = `
                                <a href="agendamento.html?ongId=${ongId}&doacaoId=${item.id}" class="btn btn-sm btn-warning">Reagendar</a>
                                <button class="btn btn-sm btn-danger ms-2 btn-cancelar-agendamento" data-doacao-id="${item.id}">Cancelar Agendamento</button>
                            `;
                        }
                    }
                }

                card.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">Doação de ${item.descricao || 'N/A'}</h5>
                        <p class="card-text">
                            ${recipientInfo}
                            <strong>Data do Registro:</strong> ${formatarData(dataRegistro)}<br>
                            <strong>Categoria:</strong> ${categoria}<br>
                            <strong>Valor Estimado:</strong> ${formatarValor(item.valor)}<br>
                            ${categorySpecificInfo}
                            ${statusInfo}
                        </p>
                        <button class="btn btn-doar-novamente btn-verde rounded-pill" data-ong-id="${ongId || ''}">
                            Doar novamente para ${ongNome || 'esta causa'}
                        </button>
                        <div class="mt-2">
                            ${actionButtons}
                        </div>
                    </div>`;
                listaDoacoesEl.appendChild(card);
            });
        } else {
            listaDoacoesEl.innerHTML = '<p>Nenhuma doação encontrada.</p>';
        }

        listaDoacoesEl.addEventListener('click', async function(event) {
            const target = event.target;
            if (target.classList.contains('btn-doar-novamente')) {
                const ongId = target.getAttribute('data-ong-id');
                if (ongId) {
                    window.location.href = `perfildaong.html?id=${ongId}`;
                } else {
                    alert('ID da ONG não encontrado. Redirecionando para a lista de ONGs.');
                    window.location.href = 'ongs.html';
                }
            }

            if (target.classList.contains('btn-cancelar-agendamento')) {
                const doacaoId = target.getAttribute('data-doacao-id');
                if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                    try {
                        const response = await fetch(window.getApiUrl(`alimentos/${doacaoId}`));
                        if (!response.ok) throw new Error('Não foi possível encontrar a doação.');
                        
                        const doacao = await response.json();
                        doacao.status = 'Pendente';
                        delete doacao.agendamento;

                        const updateResponse = await fetch(`http://localhost:3001/alimentos/${doacaoId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(doacao)
                        });

                        if (!updateResponse.ok) throw new Error('Falha ao cancelar o agendamento.');

                        alert('Agendamento cancelado com sucesso!');
                        location.reload();
                    } catch (error) {
                        console.error('Erro ao cancelar agendamento:', error);
                        alert(`Erro: ${error.message}`);
                    }
                }
            }

            if (target.classList.contains('btn-excluir-doacao')) {
                const doacaoId = target.getAttribute('data-doacao-id');
                if (confirm('Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita.')) {
                    try {
                        const deleteResponse = await fetch(`http://localhost:3001/alimentos/${doacaoId}`, { method: 'DELETE' });
                        if (!deleteResponse.ok) throw new Error('Falha ao excluir a doação.');
                        alert('Doação excluída com sucesso!');
                        location.reload();
                    } catch (error) {
                        alert(`Erro: ${error.message}`);
                    }
                }
            }
        });

    } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
        document.getElementById('info-doador').innerHTML = `<p>Erro ao carregar dados: ${error.message}</p>`;
        document.getElementById('lista-doacoes').innerHTML = '<p>Não foi possível carregar as doações.</p>';
    }

    document.getElementById('gerenciar-recorrencia').addEventListener('click', () => {
        window.location.href = 'gerenciar_recorrencias.html';
    });

    document.getElementById('nova-doacao').addEventListener('click', () => {
        window.location.href = 'ongs.html';
    });

    const editarButton = document.getElementById('editar-perfil');
    if (editarButton) {
        editarButton.addEventListener('click', () => {
            window.location.href = 'editar_perfil_usuario.html';
        });
    }

    const logoutButton = document.getElementById('logout');
    if(logoutButton) {
        logoutButton.addEventListener('click', function() {
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});

