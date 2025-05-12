let alimentos = [];

fetch('../database/valor_alimentos.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar o arquivo JSON');
        }
        return response.json();
    })
    .then(data => {
        alimentos = data.alimentos.map(item => ({
            nome: item.nome.toLowerCase(),
            valor_unitario: item.valor_unitario
        }));
    })
    .catch(error => {
        console.error('Erro ao carregar os dados:', error);
    });


fetch('../database/cadastro_doacoes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar o arquivo JSON de doações');
        }
        return response.json();
    })
    .then(data => {
        if (!localStorage.getItem("cadastro_doacoes")) {
            localStorage.setItem("cadastro_doacoes", JSON.stringify(data));
        }
    })
    .catch(error => {
        console.error('Erro ao carregar os dados de doações:', error);
    });

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

alimentoSelect.addEventListener("change", calcularValorDoacao);
quantidadeSelect.addEventListener("change", calcularValorDoacao);


document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault(); 

    const alimentoSelecionado = alimentoSelect.value;
    const quantidadeSelecionada = parseInt(quantidadeSelect.value);
    const valorTotal = valorDoacao.textContent.replace("R$", "").trim();

    const urlParams = new URLSearchParams(window.location.search);
    const nome = urlParams.get("nome") || "Anônimo";
    const email = urlParams.get("email") || "Não informado";
    const telefone = urlParams.get("telefone") || "Não informado";

    const novaDoacao = {
        doador: {
            nome: nome,
            email: email,
            telefone: telefone
        },
        data: new Date().toISOString().split("T")[0],
        descricao: alimentoSelecionado,
        quantidade: `${quantidadeSelecionada} Unidades`,
        valor: parseFloat(valorTotal)
    };

    const cadastroDoacoes = JSON.parse(localStorage.getItem("cadastro_doacoes"));

    cadastroDoacoes.doacoes_alimentos.push(novaDoacao);

    localStorage.setItem("cadastro_doacoes", JSON.stringify(cadastroDoacoes));

    alert("Doação registrada com sucesso!");

    console.log("JSON atualizado:", cadastroDoacoes);
});


document.addEventListener("DOMContentLoaded", function () {
    const cardsContainer = document.getElementById("cards-container");

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

    
    const cadastroDoacoes = JSON.parse(localStorage.getItem("cadastro_doacoes"));

    if (cadastroDoacoes && cadastroDoacoes.doacoes_alimentos) {
        const doacoes = cadastroDoacoes.doacoes_alimentos;
        doacoes.forEach(doacao => {
            const card = createCard(doacao);
            cardsContainer.appendChild(card);
        });
    } else {
        console.error("Nenhuma doação encontrada no localStorage.");
    }
});