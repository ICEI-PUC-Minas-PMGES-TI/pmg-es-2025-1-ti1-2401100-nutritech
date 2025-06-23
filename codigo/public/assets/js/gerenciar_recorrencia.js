document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('lista-doacoes');
    const info = document.getElementById('info-doador');
    const formEditar = document.getElementById('form-editar');
    const formEditarPessoais = document.getElementById('form-editar-pessoais');

    let modalEditar;
    let modalEditarPessoais;
    let currentUser = null;
    let doacoesRecorrentes = [];

    // Inicializa os modais do Bootstrap
    if (document.getElementById('modalEditar')) {
        modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'));
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

    function renderizarDadosPessoais(user) {
        const endereco = user.endereco || {};
        info.innerHTML = `
          <div class="card-pessoal">
            <strong>Nome:</strong> ${user.nome || 'Não informado'}<br>
            <strong>Email:</strong> ${user.email || 'Não informado'}<br>
            <strong>Data de Nascimento:</strong> ${user.dataNascimento || 'Não informado'}<br>
            <strong>Endereço:</strong> ${endereco.logradouro || ''} ${endereco.numero || ''}<br>
            <strong>Cidade:</strong> ${endereco.cidade || 'Não informado'}<br>
            <strong>Estado:</strong> ${endereco.estado || 'Não informado'}<br>
            <strong>Telefone:</strong> ${user.telefone || 'Não informado'}<br>
            <strong>CPF:</strong> ${user.cpf || 'Não informado'}<br>
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
            card.innerHTML = `
              <div class="card-body rounded-pill">
                <h5 class="card-title">${item.recipientOngNome || 'ONG não especificada'}</h5>
                <p class="card-text">
                  <strong>Data:</strong> ${item.data || 'Não informado'}<br>
                  <strong>Descrição:</strong> ${item.descricao || 'Não informado'}<br>
                  <strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2)}<br>
                  <strong>Recorrência:</strong> Sim<br>
                  <strong>Comprovante:</strong> <a href="${item.comprovante || '#'}" target="_blank">Ver Comprovante</a><br>
                  <button class="btn btn-editar btn-warning rounded-pill" data-id='${item.id}'>Editar</button>
                  <button class="btn btn-excluir btn-danger rounded-pill" data-id='${item.id}'>Excluir</button>
                </p>
              </div>
            `;
            lista.appendChild(card);
        });
    }

    // Event Listeners
    lista.addEventListener('click', (e) => {
        const target = e.target;
        const doacaoId = target.getAttribute('data-id');

        if (target.classList.contains('btn-editar')) {
            const doacao = doacoesRecorrentes.find(d => d.id == doacaoId);
            if (doacao) {
                document.getElementById('edit-id').value = doacao.id;
                document.getElementById('edit-valor').value = doacao.valor;
                document.getElementById('edit-data').value = doacao.data;
                modalEditar.show();
            }
        }

        if (target.classList.contains('btn-excluir')) {
            if (confirm('Tem certeza que deseja excluir esta doação recorrente?')) {
                excluirDoacao(doacaoId);
            }
        }
    });

    function excluirDoacao(doacaoId) {
        const doacaoIndex = currentUser.doacoes.findIndex(d => d.id == doacaoId);
        if (doacaoIndex > -1) {
            currentUser.doacoes.splice(doacaoIndex, 1);
            atualizarUsuarioNoServidor(currentUser, 'Doação excluída com sucesso!', 'Erro ao excluir a doação.');
        }
    }

    if (formEditar) {
        formEditar.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const valor = parseFloat(document.getElementById('edit-valor').value).toFixed(2);
            const data = document.getElementById('edit-data').value;

            const doacaoIndex = currentUser.doacoes.findIndex(d => d.id == id);
            if (doacaoIndex > -1) {
                currentUser.doacoes[doacaoIndex].valor = valor;
                currentUser.doacoes[doacaoIndex].data = data;
                atualizarUsuarioNoServidor(currentUser, 'Doação atualizada com sucesso!', 'Erro ao atualizar a doação.');
                modalEditar.hide();
            }
        });
    }

    function atualizarUsuarioNoServidor(usuario, successMsg, errorMsg) {
        fetch(`http://localhost:3000/usuarios/${usuario.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        })
        .then(res => {
            if (res.ok) {
                alert(successMsg);
                carregarDadosUsuario(usuario.id); // Recarrega tudo
            } else {
                throw new Error(errorMsg);
            }
        })
        .catch(error => {
            alert(error.message);
            console.error('Erro ao atualizar usuário:', error);
        });
    }

    // Inicializa a página
    checkLoginAndLoadData();
});
