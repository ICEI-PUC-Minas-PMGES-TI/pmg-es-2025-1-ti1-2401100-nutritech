document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('lista-doacoes');
    const info = document.getElementById('info-doador');
    const formEditar = document.getElementById('form-editar');
    const formEditarPessoais = document.getElementById('form-editar-pessoais');

    let modalEditar;
    let modalEditarPessoais;
    let currentUser = null;
    let doacoesRecorrentes = [];

    if (document.getElementById('modalEditar')) {
        modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'));


        const editCardNumberInput = document.getElementById('edit-cartao-numero');
        if (editCardNumberInput) {
            editCardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;
            });
        }

        const editCardValidityInput = document.getElementById('edit-cartao-validade');
        if (editCardValidityInput) {
            editCardValidityInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 6);
                }
                e.target.value = value;
            });
        }
    }
    if (document.getElementById('modalEditarPessoais')) {
        modalEditarPessoais = new bootstrap.Modal(document.getElementById('modalEditarPessoais'));
    }

    function checkLoginAndLoadData() {
        const usuarioCorrente = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
        if (!usuarioCorrente || !usuarioCorrente.id) {
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = 'login.html';
            return;
        }
        currentUser = usuarioCorrente;
        carregarDadosUsuario(currentUser.id);
    }

    function carregarDadosUsuario(userId) {
        fetch(`http://localhost:3001/usuarios/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error('Falha ao carregar dados do usuário.');
                return res.json();
            })
            .then(user => {
                currentUser = user; // Atualiza com os dados mais recentes
                renderizarDadosPessoais(user);
                renderizarDoacoes(user.doacoes || []);
            })
            .catch(error => {
                console.error('Erro:', error);
                info.innerHTML = '<p>Não foi possível carregar seus dados. Tente novamente mais tarde.</p>';
                lista.innerHTML = '<p>Não foi possível carregar suas doações.</p>';
            });
    }

    function formatarCPF(cpf) {
        if (!cpf) return 'Não informado';
        const cpfLimpo = String(cpf).replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            return cpf; 
        }
        return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

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

    function renderizarDadosPessoais(user) {
        const endereco = user.endereco || {};
        info.innerHTML = `
          <div class="card-pessoal">
            <strong>Nome:</strong> ${user.nome || 'Não informado'}<br>
            <strong>Email:</strong> ${user.email || 'Não informado'}<br>
            <strong>Data de Nascimento:</strong> ${formatarData(user.dataNascimento)}<br>
            <strong>Endereço:</strong> ${endereco.logradouro || ''} ${endereco.numero || ''}<br>
            <strong>Cidade:</strong> ${endereco.cidade || 'Não informado'}<br>
            <strong>Estado:</strong> ${endereco.estado || 'Não informado'}<br>
            <strong>Telefone:</strong> ${user.telefone || 'Não informado'}<br>
            <strong>CPF:</strong> ${formatarCPF(user.cpf)}<br>
          </div>
        `;
    }

    function renderizarDoacoes(doacoes) {
        lista.innerHTML = '';
        doacoesRecorrentes = doacoes.filter(d => d.recorrencia === true && d.categoria !== "Alimentos");

        if (doacoesRecorrentes.length === 0) {
            lista.innerHTML = '<p>Nenhuma doação recorrente encontrada.</p>';
            return;
        }

        doacoesRecorrentes.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card mb-3 shadow rounded-4';
            
            let cardInfo = 'Não informado';
            if (item.pagamento && item.pagamento.cartao && item.pagamento.cartao.numero) {
                cardInfo = `Cartão final **** ${item.pagamento.cartao.numero.slice(-4)}`;
            }

            card.innerHTML = `
              <div class="card-body rounded-pill">
                <h5 class="card-title">${item.recipientOngNome || 'ONG não especificada'}</h5>
                <p class="card-text">
                  <strong>Próxima Doação:</strong> ${formatarData(item.data)}<br>
                  <strong>Valor:</strong> R$ ${parseFloat(item.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}<br>
                  <strong>Pagamento:</strong> ${cardInfo}<br>
                  <strong>Recorrência:</strong> Sim<br>
                  <button class="btn btn-editar btn-warning rounded-pill" data-id='${item.id}'>Editar</button>
                  <button class="btn btn-excluir btn-danger rounded-pill" data-id='${item.id}'>Cancelar Recorrência</button>
                </p>
              </div>
            `;
            lista.appendChild(card);
        });
    }

    lista.addEventListener('click', (e) => {
        const target = e.target;
        const doacaoIdStr = target.getAttribute('data-id');

        if (!doacaoIdStr) {
            return;
        }

        if (target.classList.contains('btn-editar')) {
            const doacao = doacoesRecorrentes.find(d => String(d.id) === doacaoIdStr);
            if (doacao) {
                sessionStorage.setItem('doacaoParaEditar', JSON.stringify(doacao));
                window.location.href = 'cartao.html';
            }
        }

        if (target.classList.contains('btn-excluir')) {
            if (confirm('Tem certeza que deseja cancelar a recorrência desta doação?')) {
                cancelarRecorrencia(doacaoIdStr);
            }
        }
    });

    function cancelarRecorrencia(doacaoIdStr) {
        const doacaoIndex = currentUser.doacoes.findIndex(d => String(d.id) === doacaoIdStr);
        if (doacaoIndex > -1) {
            currentUser.doacoes[doacaoIndex].recorrencia = false;
            atualizarUsuarioNoServidor(currentUser, 'A recorrência da doação foi cancelada.', 'Erro ao cancelar a recorrência da doação.');
        }
    }

    if (formEditar) {
        formEditar.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const valor = parseFloat(document.getElementById('edit-valor').value).toFixed(2);
            const data = document.getElementById('edit-data').value;

            const doacaoIndex = currentUser.doacoes.findIndex(d => String(d.id) === id);
            if (doacaoIndex > -1) {
                currentUser.doacoes[doacaoIndex].valor = valor;
                currentUser.doacoes[doacaoIndex].data = data;

                const cartao = {
                    numero: document.getElementById('edit-cartao-numero').value,
                    nome: document.getElementById('edit-cartao-nome').value,
                    validade: document.getElementById('edit-cartao-validade').value,
                    cvv: document.getElementById('edit-cartao-cvv').value,
                };

                if (!currentUser.doacoes[doacaoIndex].pagamento) {
                    currentUser.doacoes[doacaoIndex].pagamento = {};
                }
                currentUser.doacoes[doacaoIndex].pagamento.cartao = cartao;

                atualizarUsuarioNoServidor(currentUser, 'Doação atualizada com sucesso!', 'Erro ao atualizar a doação.');
                modalEditar.hide();
            }
        });
    }

    document.getElementById('btn-editar-pessoais').addEventListener('click', () => {
        if (currentUser) {
            document.getElementById('edit-nome').value = currentUser.nome || '';
            document.getElementById('edit-email').value = currentUser.email || '';
            document.getElementById('edit-dataNascimento').value = currentUser.dataNascimento || '';
            document.getElementById('edit-logradouro').value = currentUser.endereco?.logradouro || '';
            document.getElementById('edit-numero').value = currentUser.endereco?.numero || '';
            document.getElementById('edit-cidade').value = currentUser.endereco?.cidade || '';
            document.getElementById('edit-estado').value = currentUser.endereco?.estado || '';
            document.getElementById('edit-telefone').value = currentUser.telefone || '';
            document.getElementById('edit-cpf').value = currentUser.cpf || '';
            modalEditarPessoais.show();
        }
    });

    if (formEditarPessoais) {
        formEditarPessoais.addEventListener('submit', (e) => {
            e.preventDefault();
            const updatedUser = {
                ...currentUser,
                nome: document.getElementById('edit-nome').value,
                email: document.getElementById('edit-email').value,
                dataNascimento: document.getElementById('edit-dataNascimento').value,
                endereco: {
                    ...currentUser.endereco,
                    logradouro: document.getElementById('edit-logradouro').value,
                    numero: document.getElementById('edit-numero').value,
                    cidade: document.getElementById('edit-cidade').value,
                    estado: document.getElementById('edit-estado').value,
                },
                telefone: document.getElementById('edit-telefone').value,
            };
            
            atualizarUsuarioNoServidor(updatedUser, 'Dados pessoais atualizados com sucesso!', 'Erro ao atualizar os dados.');
            modalEditarPessoais.hide();
        });
    }

    function atualizarUsuarioNoServidor(usuario, successMsg, errorMsg) {
        fetch(`http://localhost:3001/usuarios/${usuario.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        })
        .then(res => {
            if (res.ok) {
                alert(successMsg);
                carregarDadosUsuario(usuario.id);
            } else {
                throw new Error(errorMsg);
            }
        })
        .catch(error => {
            alert(error.message);
            console.error('Erro ao atualizar usuário:', error);
        });
    }

    checkLoginAndLoadData();
});
