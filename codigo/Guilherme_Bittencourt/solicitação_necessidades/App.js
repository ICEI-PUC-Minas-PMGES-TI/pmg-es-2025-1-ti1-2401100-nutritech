// Função para alternar entre os formulários
function toggleForm() {
    const tipo = document.querySelector('input[name="type"]:checked').value;
    document.getElementById('alimento-form').classList.toggle('hidden', tipo !== 'alimento');
    document.getElementById('voluntario-form').classList.toggle('hidden', tipo !== 'voluntario');

    // Ocultar a lista incorreta
    document.getElementById('alimento-list').classList.toggle('hidden', tipo !== 'alimento');
    document.getElementById('voluntario-list').classList.toggle('hidden', tipo !== 'voluntario');
}

// Função para adicionar itens à lista
function addItem(tipo) {
    const itemInput = document.getElementById(`${tipo}-item`);
    const itemList = document.getElementById(`${tipo}-list`);

    const newItem = itemInput.value.trim();
    if (newItem === "") return;

    const listItem = document.createElement('li');
    listItem.textContent = newItem; // Insere apenas o texto do item
    itemList.appendChild(listItem);

    itemInput.value = ""; // Limpa o campo de entrada
}

// Função para enviar os dados
function submitData(tipo) {
    const itemList = Array.from(document.getElementById(`${tipo}-list`).children).map(item => item.textContent); // Pega os itens da lista
    const deadline = document.getElementById(`${tipo}-deadline`).value;

    if (!itemList.length || !deadline) {
        alert("Preencha todos os campos antes de enviar!");
        return;
    }

    // Ler o arquivo necessidades.json do localStorage
    let necessidades = JSON.parse(localStorage.getItem("necessidades")) || { alimentos: [], voluntarios: [] };

    // Atualizar os dados no formato correto
    necessidades[tipo + "s"] = [...necessidades[tipo + "s"], ...itemList.map(item => ({ item, deadline }))];

    // Salvar no localStorage
    localStorage.setItem("necessidades", JSON.stringify(necessidades));

    alert("Dados salvos com sucesso!");

    // Limpar formulário após envio
    document.getElementById(`${tipo}-list`).innerHTML = ""; // Limpa a lista visual
    document.getElementById(`${tipo}-item`).value = ""; // Limpa o campo de texto
    document.getElementById(`${tipo}-deadline`).value = ""; // Limpa o campo de prazo
}

// Configurar a data mínima para o seletor de data
const today = new Date().toISOString().split('T')[0];
document.getElementById('alimento-deadline').setAttribute('min', today);
document.getElementById('voluntario-deadline').setAttribute('min', today);

// Carregar dados iniciais do localStorage
window.onload = () => {
    const necessidades = JSON.parse(localStorage.getItem("necessidades")) || { alimentos: [], voluntarios: [] };

    // Limpar as listas antes de preencher
    document.getElementById('alimento-list').innerHTML = "";
    document.getElementById('voluntario-list').innerHTML = "";

    // Preencher a lista de alimentos
    necessidades.alimentos.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.item} (Prazo: ${item.deadline})`;
        document.getElementById('alimento-list').appendChild(listItem);
    });

    // Preencher a lista de voluntários
    necessidades.voluntarios.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.item} (Prazo: ${item.deadline})`;
        document.getElementById('voluntario-list').appendChild(listItem);
    });
};