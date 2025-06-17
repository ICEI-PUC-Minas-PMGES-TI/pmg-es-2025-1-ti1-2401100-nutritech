let alimentos = [];
let targetOngId = null;
let targetOngNome = null;


function getUsuarioCorrente() {
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        try {
            return JSON.parse(usuarioCorrenteJSON);
        } catch (e) {
            console.error("Error parsing usuarioCorrente from sessionStorage:", e);
            return null;
        }
    }
    return null;
}

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
    carregarJSON('assets/js/valor_alimentos.json', 'Erro ao carregar o arquivo JSON')
        .then(data => {
            alimentos = data.alimentos.map(item => ({
                nome: item.nome.toLowerCase(),
                valor_unitario: item.valor_unitario
            }));
        })
        .catch(error => console.error('Erro ao carregar os dados:', error));
}

async function obterEntidadeAPI(id, type) {
    const basePath = type === 'ong' ? 'http://localhost:3001/ongs' : 'http://localhost:3001/usuarios';
    const res = await fetch(`${basePath}/${id}`);
    if (!res.ok) throw new Error(`Erro ao buscar ${type} ID ${id} na API`);
    return res.json();
}


async function atualizarEntidadeAPI(id, dataToUpdate, type) {
    const basePath = type === 'ong' ? 'http://localhost:3001/ongs' : 'http://localhost:3001/usuarios';
    const res = await fetch(`${basePath}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate)
    });
    if (!res.ok) throw new Error(`Erro ao atualizar ${type} ID ${id} na API`);
    return res.json();
}

function createCard(doacao) {
    const card = document.createElement("div");
    card.className = "col-md-4 py-3";
    let recipientInfo = '';

    if (doacao.recipientOngNome) {
        recipientInfo = `<strong>Para:</strong> ${doacao.recipientOngNome}<br>`;
    }

    card.innerHTML = `
        <div class="card" style="width: 100%;">
            <div class="card-body">
                <h5 class="card-title">Doação de ${doacao.descricao || 'N/A'}</h5>
                <h6 class="card-subtitle mb-2 text-body-secondary">Data: ${doacao.data}</h6>
                <p class="card-text">
                    ${recipientInfo} 
                    <strong>Quantidade:</strong> ${doacao.quantidade}<br>
                    <strong>Valor:</strong> R$${(doacao.valor || 0).toFixed(2)}
                </p>
            </div>
        </div>
    `;
    return card;
}

async function exibirCardsDeDoacoes() {
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = "";

    const usuarioLogado = getUsuarioCorrente();
    if (!usuarioLogado) {
        cardsContainer.innerHTML = "<p>Faça login para visualizar o histórico de suas doações.</p>";
        return;
    }

    try {
        const entidade = await obterEntidadeAPI(usuarioLogado.id, usuarioLogado.type);

        if (entidade && entidade.doacoes && entidade.doacoes.length > 0) {
            entidade.doacoes.forEach(doacao => {
                const card = createCard(doacao); 
                cardsContainer.appendChild(card);
            });
        } else {
            cardsContainer.innerHTML = "<p>Você ainda não registrou nenhuma doação.</p>";
        }
    } catch (err) {
        console.error('Erro ao exibir cards de doações:', err);
        cardsContainer.innerHTML = "<p>Erro ao carregar seu histórico de doações.</p>";
    }
}

document.addEventListener("DOMContentLoaded", async function () {

    const urlParams = new URLSearchParams(window.location.search);
    targetOngId = urlParams.get("ongId");

    if (targetOngId) {
        try {
            const ongData = await obterEntidadeAPI(targetOngId, 'ong');
            targetOngNome = ongData.nome_fantasia || ongData.nome;
            const pageHeaderElement = document.getElementById('donation-target-ong-name');
            if (pageHeaderElement) {
                pageHeaderElement.textContent = `Você está doando para: ${targetOngNome}`;
            } else {
                // Fallback or error if element not found, though it should be present now.
                console.warn("Element with ID 'donation-target-ong-name' not found. ONG name not displayed.");
            }
        } catch (error) {
            console.error("Erro ao buscar dados da ONG de destino:", error);
            alert("Não foi possível carregar informações da ONG de destino. A doação pode não ser registrada corretamente.");

        }
    }

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
        const valorTotalText = valorDoacao.textContent.replace("R$", "").trim();

        const usuarioLogado = getUsuarioCorrente();
        if (!usuarioLogado) {
            alert("Usuário não logado. Operação não permitida.");
            return null;
        }
        
        const nomeDoador = usuarioLogado.type === 'ong' ? 
                           (usuarioLogado.nome_fantasia || usuarioLogado.nome || 'ONG Anônima') : 
                           (usuarioLogado.nome || 'Usuário Anônimo');

        return {
            doador: { 
                id: usuarioLogado.id,
                nome: nomeDoador,
                email: usuarioLogado.email || "Não informado",
                telefone: usuarioLogado.telefone || "Não informado",
                type: usuarioLogado.type
            },
            data: new Date().toISOString().split("T")[0],
            descricao: alimentoSelecionado,
            quantidade: `${quantidadeSelecionada} Unidades`,
            valor: parseFloat(valorTotalText) || 0
        };
    }

    async function registrarDoacao(event) {
        event.preventDefault();

        const usuarioLogado = getUsuarioCorrente();
        if (!usuarioLogado) {
            alert('Usuário não logado! Faça o login para registrar uma doação.');
            window.location.href = 'login.html';
            return;
        }

        if (!targetOngId) {
            alert('Nenhuma ONG de destino especificada. Não é possível registrar a doação. Verifique o link ou navegue a partir da página de uma ONG.');
            return;
        }
        
        const novaDoacaoData = criarNovaDoacao(); 
        if (!novaDoacaoData) {
             alert('Não foi possível criar os dados da doação. Verifique se está logado.');
             return;
        }
        
        const donationId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
        const dataAtual = novaDoacaoData.data;

        try {

            const ongAlvo = await obterEntidadeAPI(targetOngId, 'ong');
            if (!ongAlvo.doacoes) ongAlvo.doacoes = [];

            let familiasAjudadas = parseInt(ongAlvo.familias_ajudadas) || 0;
            familiasAjudadas++;

            const doacaoParaONG = {
                donationId: donationId,
                doadorId: usuarioLogado.id,
                doadorNome: novaDoacaoData.doador.nome,
                doadorTipo: usuarioLogado.type,
                data: dataAtual,
                descricao: novaDoacaoData.descricao,
                quantidade: novaDoacaoData.quantidade,
                valor: novaDoacaoData.valor,
                fonte: 'cadastro_doacao.html'
            };
            ongAlvo.doacoes.push(doacaoParaONG);

            await atualizarEntidadeAPI(targetOngId, { 
                doacoes: ongAlvo.doacoes,
                familias_ajudadas: familiasAjudadas 
            }, 'ong');

            const doadorInfo = await obterEntidadeAPI(usuarioLogado.id, usuarioLogado.type); 
            if (!doadorInfo.doacoes) doadorInfo.doacoes = [];
            
            const doacaoParaDoador = {
                donationId: donationId,
                recipientOngId: targetOngId,
                recipientOngNome: targetOngNome || (ongAlvo.nome_fantasia || ongAlvo.nome), 
                data: dataAtual,
                descricao: novaDoacaoData.descricao,
                quantidade: novaDoacaoData.quantidade,
                valor: novaDoacaoData.valor,
                fonte: 'cadastro_doacao.html'
            };
            doadorInfo.doacoes.push(doacaoParaDoador);

            await atualizarEntidadeAPI(usuarioLogado.id, { doacoes: doadorInfo.doacoes }, usuarioLogado.type);

            doadorInfo.type = usuarioLogado.type;

            sessionStorage.setItem('usuarioCorrente', JSON.stringify(doadorInfo));

            alert(`Doação para ${targetOngNome || 'ONG'} registrada com sucesso!`);
            exibirCardsDeDoacoes();

        } catch (err) {
            alert('Erro ao registrar doação: ' + err.message);
            console.error('Full error object:', err);
        }
    }

    alimentoSelect.addEventListener("change", calcularValorDoacao);
    quantidadeSelect.addEventListener("change", calcularValorDoacao);
    document.querySelector("form").addEventListener("submit", registrarDoacao);
    carregarAlimentos();
    exibirCardsDeDoacoes();
});
