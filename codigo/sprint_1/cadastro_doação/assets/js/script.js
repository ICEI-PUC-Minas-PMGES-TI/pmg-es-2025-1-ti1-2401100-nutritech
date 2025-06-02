let alimentos = [];

function carregarJSON(caminho, erroMsg) {
    return fetch(caminho)
        .then(response => {
            if (!response.ok) {
                throw new Error(erroMsg);
            }
            return response.json();
        });
}

function carregarAlimentos() {
    carregarJSON('assets/database/valor_alimentos.json', 'Erro ao carregar o arquivo JSON')
        .then(data => {
            alimentos = data.alimentos.map(item => ({
                nome: item.nome.toLowerCase(),
                valor_unitario: item.valor_unitario
            }));
        })
        .catch(error => console.error('Erro ao carregar os dados:', error));
}

async function obterUsuariosAPI() {
    const res = await fetch('http://localhost:3001/usuarios');
    if (!res.ok) throw new Error('Erro ao buscar usuários na API');
    return res.json();
}

async function atualizarUsuarioAPI(id, usuarioAtualizado) {
    const res = await fetch(`http://localhost:3001/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioAtualizado)
    });
    if (!res.ok) throw new Error('Erro ao atualizar usuário na API');
    return res.json();
}

function createCard(doacao) {
    const card = document.createElement("div");
    card.className = "col-md-4 py-3";
    card.innerHTML = `
        <div class="card" style="width: 100%;">
            <div class="card-body">
                <h5 class="card-title">${doacao.doador.nome}</h5>
                <h6 class="card-subtitle mb-2 text-body-secondary">${doacao.data}</h6>
                <p class="card-text">
                    <strong>Descrição:</strong> ${doacao.descricao}<br>
                    <strong>Quantidade:</strong> ${doacao.quantidade}<br>
                    <strong>Valor:</strong> R$${doacao.valor.toFixed(2)}
                </p>
            </div>
        </div>
    `;
    return card;
}

async function exibirCardsDeDoacoes() {
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = "";
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) {
        console.error("ID não informado na URL.");
        return;
    }
    try {
        const usuarios = await obterUsuariosAPI();
        const usuario = usuarios.find(u => String(u.id) === String(id));
        if (usuario && usuario.doacoes) {
            usuario.doacoes.forEach(doacao => {
                if (!doacao.doador) doacao.doador = { nome: usuario.nome };
                const card = createCard(doacao);
                cardsContainer.appendChild(card);
            });
        }
    } catch (err) {
        console.error('Erro ao exibir cards:', err);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const alimentoSelect = document.getElementById("alimento");
    const quantidadeSelect = document.getElementById("quantidade");
    const valorDoacao = document.getElementById("valorDoacao");

    function calcularValorDoacao() {
        const alimentoSelecionado = alimentoSelect.value.toLowerCase();
        const quantidadeSelecionada = parseInt(quantidadeSelect.value);

        if (!alimentoSelecionado || isNaN(quantidadeSelecionada)) {
            valorDoacao.textContent = "R$0";
            return;
        }

        const alimento = alimentos.find(item => item.nome === alimentoSelecionado);

        if (alimento) {
            const valorTotal = alimento.valor_unitario * quantidadeSelecionada;
            valorDoacao.textContent = `R$${valorTotal.toFixed(2)}`;
        } else {
            valorDoacao.textContent = "R$0";
        }
    }

    function criarNovaDoacao() {
        const alimentoSelecionado = alimentoSelect.value;
        const quantidadeSelecionada = parseInt(quantidadeSelect.value);
        const valorTotal = valorDoacao.textContent.replace("R$", "").trim();

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        const nome = urlParams.get("nome") || "Anônimo";
        const email = urlParams.get("email") || "Não informado";
        const telefone = urlParams.get("telefone") || "Não informado";

        return {
            doador: { id, nome, email, telefone },
            data: new Date().toISOString().split("T")[0],
            descricao: alimentoSelecionado,
            quantidade: `${quantidadeSelecionada} Unidades`,
            valor: parseFloat(valorTotal)
        };
    }

    async function registrarDoacao(event) {
        event.preventDefault();
        const novaDoacao = criarNovaDoacao();
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");
        if (!id) {
            alert('ID do usuário não informado!');
            return;
        }
        try {
            const usuarios = await obterUsuariosAPI();
            const usuario = usuarios.find(u => String(u.id) === String(id));
            if (!usuario) {
                alert('Usuário não encontrado!');
                return;
            }
            if (!usuario.doacoes) usuario.doacoes = [];
            usuario.doacoes.push({
                descricao: novaDoacao.descricao,
                quantidade: novaDoacao.quantidade,
                valor: novaDoacao.valor,
                data: novaDoacao.data,
                fonte: 'cadastro_doacao.html',
                doador: { nome: usuario.nome }
            });
            await atualizarUsuarioAPI(id, { doacoes: usuario.doacoes });
            alert("Doação registrada com sucesso!");
            exibirCardsDeDoacoes();
        } catch (err) {
            alert('Erro ao registrar doação: ' + err.message);
        }
    }

    alimentoSelect.addEventListener("change", calcularValorDoacao);
    quantidadeSelect.addEventListener("change", calcularValorDoacao);
    document.querySelector("form").addEventListener("submit", registrarDoacao);
    carregarAlimentos();
    exibirCardsDeDoacoes();
});
