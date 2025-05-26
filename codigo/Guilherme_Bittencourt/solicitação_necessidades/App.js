// Função para alternar entre os formulários
function toggleForm() {
    const tipo = document.querySelector('input[name="type"]:checked').value;
    document.getElementById('alimento-form').classList.toggle('hidden', tipo !== 'alimento');
    document.getElementById('voluntario-form').classList.toggle('hidden', tipo !== 'voluntario');

    // Ocultar a lista incorreta
    document.getElementById('alimento-list').classList.toggle('hidden', tipo !== 'alimento');
    document.getElementById('voluntario-list').classList.toggle('hidden', tipo !== 'voluntario');
}

// Função para adicionar itens à listagem temporária
function addItem(tipo) {
    const itemInput = document.getElementById(`${tipo}-item`);
    const itemList = document.getElementById(`${tipo}-list`);

    const newItem = itemInput.value.trim();
    if (newItem === "") return;

    // Criar o elemento <li> para o item
    const listItem = document.createElement('li');
    listItem.className = "d-flex justify-content-between align-items-center";

    // Criar o texto do item
    const itemText = document.createElement('span');
    itemText.textContent = newItem;
    listItem.appendChild(itemText);

    // Criar o botão de exclusão (sem perguntar)
    const deleteButton = document.createElement('span');
    deleteButton.className = "btn-delete";
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="red" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1zm4 0A.5.5 0 0 1 10 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1z"/><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm13 0A2 2 0 0 1 14 2V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h13z"/></svg>';
    deleteButton.onclick = () => removeTemporaryItem(listItem); // Remover da listagem temporária
    listItem.appendChild(deleteButton);

    // Adicionar o item à lista temporária
    itemList.appendChild(listItem);

    itemInput.value = ""; // Limpar o campo de entrada
}

// Função para remover um item da listagem temporária
function removeTemporaryItem(item) {
    item.remove(); // Remover o elemento da lista visual
}

// Função para enviar os dados
function submitData(tipo) {
    const itemList = Array.from(document.getElementById(`${tipo}-list`).children).map(item => item.firstChild.textContent); // Pega os itens da lista temporária
    const deadline = document.getElementById(`${tipo}-deadline`).value;

    if (!itemList.length || !deadline) {
        alert("Preencha todos os campos antes de enviar!");
        return;
    }

    // Ler o arquivo necessidades.json do localStorage
    let necessidades = JSON.parse(localStorage.getItem("necessidades")) || { alimentos: [], voluntarios: [] };

    // Atualizar os dados no formato correto
    necessidades[tipo + "s"] = [
        ...necessidades[tipo + "s"],
        ...itemList.map(item => ({ item, deadline }))
    ];

    // Salvar no localStorage
    localStorage.setItem("necessidades", JSON.stringify(necessidades));

    alert("Dados salvos com sucesso!");

    // Limpar listagem temporária após envio
    document.getElementById(`${tipo}-list`).innerHTML = ""; // Limpa a lista visual
    document.getElementById(`${tipo}-item`).value = ""; // Limpa o campo de texto
    document.getElementById(`${tipo}-deadline`).value = ""; // Limpa o campo de prazo

    // Atualizar a listagem permanente
    updateSavedList(tipo);
}

// Função para atualizar a listagem permanente
function updateSavedList(tipo) {
    const savedList = document.getElementById(`saved-${tipo}s`);
    savedList.innerHTML = ""; // Limpar a lista antes de preencher

    const necessidades = JSON.parse(localStorage.getItem("necessidades")) || { alimentos: [], voluntarios: [] };

    necessidades[tipo + "s"].forEach(savedItem => {
        // Criar o elemento <li> para o item
        const listItem = document.createElement('li');
        listItem.className = "d-flex justify-content-between align-items-center";

        // Verificar se o item é válido e exibir sua descrição
        const itemDescription = typeof savedItem === "object" && savedItem !== null && "item" in savedItem && "deadline" in savedItem
            ? `${savedItem.item} (Prazo: ${savedItem.deadline})`
            : `[Formato Inválido]`;

        const itemText = document.createElement('span');
        itemText.textContent = itemDescription;

        // Adiciona o <span> ao <li>
        listItem.appendChild(itemText);

        // ✅ Adiciona o <li> à lista UL/OL
        savedList.appendChild(listItem);

        

        // Criar o botão de exclusão
        const deleteButton = document.createElement('span');
        deleteButton.className = "btn-delete";
        deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="red" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1zm4 0A.5.5 0 0 1 10 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1z"/><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm13 0A2 2 0 0 1 14 2V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h13z"/></svg>';
        deleteButton.onclick = () => confirmAndRemoveSavedItem(savedItem, tipo); // Confirmar e remover
        listItem.appendChild(deleteButton);

        savedList.appendChild(listItem);
    });
}

// Função para confirmar e remover um item salvo permanentemente
function confirmAndRemoveSavedItem(savedItem, tipo) {
    if (confirm("Tem certeza de que deseja excluir este item permanentemente?")) {
        removeSavedItem(savedItem, tipo);
    }
}

// Função para remover um item salvo permanentemente
function removeSavedItem(itemToRemove, tipo) {
    // Ler os dados salvos
    let necessidades = JSON.parse(localStorage.getItem("necessidades")) || { alimentos: [], voluntarios: [] };

    // Filtrar os itens salvos no localStorage
    necessidades[tipo + "s"] = necessidades[tipo + "s"].filter(savedItem => {
        // Comparar apenas os objetos válidos
        if (typeof savedItem === "object" && savedItem !== null && "item" in savedItem && "deadline" in savedItem) {
            return savedItem.item !== itemToRemove.item || savedItem.deadline !== itemToRemove.deadline;
        }
        // Para itens inválidos, removê-los diretamente
        return false;
    });

    // Salvar no localStorage
    localStorage.setItem("necessidades", JSON.stringify(necessidades));

    // Atualizar a listagem permanente
    updateSavedList(tipo);
}

// Configurar a data mínima para o seletor de data
const today = new Date().toISOString().split('T')[0];
document.getElementById('alimento-deadline').setAttribute('min', today);
document.getElementById('voluntario-deadline').setAttribute('min', today);

// Carregar dados iniciais do localStorage
window.onload = function() {
    const currentDate = new Date().toISOString().split('T')[0];
    document.getElementById('alimento-deadline').min = currentDate;
    document.getElementById('voluntario-deadline').min = currentDate;
    updateSavedList("alimento");
    updateSavedList("voluntario");

    // ... restante do código idêntico ao original ...
};


// Função auxiliar para adicionar itens à listagem permanente
function addItemToSavedList(tipo, savedItem) {
    const savedList = document.getElementById(`saved-${tipo}s`);

    const listItem = document.createElement('li');
    listItem.className = "d-flex justify-content-between align-items-center";

    // Verificar se o item é válido e exibir sua descrição
    const itemDescription = typeof savedItem === "object" && savedItem !== null && "item" in savedItem && "deadline" in savedItem
        ? `${savedItem.item} (Prazo: ${savedItem.deadline})`
        : `[Formato Inválido]`;

    const itemText = document.createElement('span');
    itemText.textContent = itemDescription;
    listItem.appendChild(itemText);

    // Criar o botão de exclusão
    const deleteButton = document.createElement('span');
    deleteButton.className = "btn-delete";
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="red" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1zm4 0A.5.5 0 0 1 10 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1z"/><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm13 0A2 2 0 0 1 14 2V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h13z"/></svg>';
    deleteButton.onclick = () => confirmAndRemoveSavedItem(savedItem, tipo);
    listItem.appendChild(deleteButton);

    savedList.appendChild(listItem);
}