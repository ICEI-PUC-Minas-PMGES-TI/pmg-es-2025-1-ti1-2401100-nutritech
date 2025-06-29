function getUsuarioCorrente() {
    const usuarioCorrenteJSON = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
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

async function obterEntidadeAPI(id, type) {
    const basePath = type === 'ong' ? window.getApiUrl('ongs') : window.getApiUrl('usuarios');
    const res = await fetch(`${basePath}/${id}`);
    if (!res.ok) throw new Error(`Erro ao buscar ${type} ID ${id} na API`);
    return res.json();
}

async function atualizarEntidadeAPI(id, dataToUpdate, type) {
    const basePath = type === 'ong' ? window.getApiUrl('ongs') : window.getApiUrl('usuarios');
    const res = await fetch(`${basePath}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate)
    });
    if (!res.ok) throw new Error(`Erro ao atualizar ${type} ID ${id} na API`);
    return res.json();
}

function toggleForm() {
    const tipo = document.querySelector('input[name="type"]:checked').value;
    document.getElementById('alimento-form').classList.toggle('hidden', tipo !== 'alimento');
    document.getElementById('voluntario-form').classList.toggle('hidden', tipo !== 'voluntario');

    document.getElementById('alimento-item').value = '';
    document.getElementById('alimento-valor').value = '';
    document.getElementById('alimento-quantidade').value = '';
    document.getElementById('voluntario-item').value = '';
    document.getElementById('saved-alimentos').classList.toggle('hidden', tipo !== 'alimento');
    document.getElementById('saved-voluntarios').classList.toggle('hidden', tipo !== 'voluntario');
}

async function submitData(tipo) {
    const ongLogada = getUsuarioCorrente();
    if (!ongLogada || ongLogada.type !== 'ong') {
        alert("Você precisa estar logado como uma ONG para adicionar necessidades.");
        return;
    }

    const itemInput = document.getElementById(`${tipo}-item`);
    const deadlineInput = document.getElementById(`${tipo}-deadline`);
    
    const item = itemInput.value.trim();
    const deadline = deadlineInput.value;

    if (!item || !deadline) {
        alert("Preencha o nome do item e o prazo antes de enviar.");
        return;
    }

    let novaNecessidade;

    if (tipo === 'alimento') {
        const valorInput = document.getElementById('alimento-valor');
        const quantidadeInput = document.getElementById('alimento-quantidade');
        
        const valorEstimado = valorInput.value.trim();
        const quantidade = quantidadeInput.value.trim();

        if (valorEstimado === "" || isNaN(parseFloat(valorEstimado)) || parseFloat(valorEstimado) <= 0) {
            alert("Por favor, insira um valor por unidade válido.");
            return;
        }
        if (quantidade === "" || isNaN(parseInt(quantidade)) || parseInt(quantidade) <= 0) {
            alert("Por favor, insira uma quantidade válida.");
            return;
        }

        novaNecessidade = {
            id: `necessidade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            item: item,
            deadline: deadline,
            status: 'aberta',
            valorEstimado: parseFloat(valorEstimado),
            quantidadeTotal: parseInt(quantidade, 10),
            quantidadeDoada: 0
        };

    } else {
        novaNecessidade = {
            id: `necessidade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            item: item,
            deadline: deadline,
            status: 'aberta'
        };
    }

    try {
        const ongData = await obterEntidadeAPI(ongLogada.id, 'ong');
        const key = tipo === 'alimento' ? 'necessidades_alimentos' : 'necessidades_voluntarios';
        
        if (!ongData[key]) {
            ongData[key] = [];
        }

        const updatedNecessidades = [...ongData[key], novaNecessidade];
        await atualizarEntidadeAPI(ongLogada.id, { [key]: updatedNecessidades }, 'ong');

        alert("Necessidade salva com sucesso!");

        itemInput.value = "";
        deadlineInput.value = "";
        if (tipo === 'alimento') {
            document.getElementById('alimento-valor').value = "";
            document.getElementById('alimento-quantidade').value = "";
        }

        const savedList = document.getElementById(`saved-${tipo}s`);
        const listItem = document.createElement('li');
        listItem.className = "d-flex justify-content-between align-items-center";
        const itemText = document.createElement('span');
        let textContent = `${novaNecessidade.item} (Prazo: ${novaNecessidade.deadline})`;
        if (tipo === 'alimento' && novaNecessidade.valorEstimado) {
            const restante = novaNecessidade.quantidadeTotal - novaNecessidade.quantidadeDoada;
            textContent = `${novaNecessidade.item} - ${novaNecessidade.quantidadeDoada}/${novaNecessidade.quantidadeTotal} unidades (Faltam ${restante}) | Prazo: ${novaNecessidade.deadline}`;
        }
        itemText.textContent = textContent;
        listItem.appendChild(itemText);
        const deleteButton = document.createElement('span');
        deleteButton.className = "btn-delete";
        deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="red" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1zm4 0A.5.5 0 0 1 10 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1z"/><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm13 0A2 2 0 0 1 14 2V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h13z"/></svg>';
        deleteButton.onclick = () => confirmAndRemoveSavedItem(novaNecessidade, tipo);
        listItem.appendChild(deleteButton);
        savedList.appendChild(listItem);

        updateSavedList(tipo);
        document.getElementById(`saved-${tipo}s`).classList.remove('hidden');
        document.getElementById(`saved-${tipo === 'alimento' ? 'voluntario' : 'alimento'}s`).classList.add('hidden');

    } catch (error) {
        console.error("Erro ao salvar necessidade:", error);
        alert("Ocorreu um erro ao salvar a necessidade. Tente novamente.");
    }
}

async function updateSavedList(tipo) {
    const ongLogada = getUsuarioCorrente();
    if (!ongLogada || ongLogada.type !== 'ong') return;

    const savedList = document.getElementById(`saved-${tipo}s`);
    savedList.innerHTML = "<li>Carregando...</li>";

    try {
        const ongData = await obterEntidadeAPI(ongLogada.id, 'ong');
        savedList.innerHTML = "";

        const key = tipo === 'alimento' ? 'necessidades_alimentos' : 'necessidades_voluntarios';
        console.log('ongData[key]:', ongData[key]);
        const necessidades = (ongData[key] || []).filter(n => !n.status || n.status === 'aberta');
        console.log('Necessidades filtradas:', necessidades);

        if (necessidades.length === 0) {
            savedList.innerHTML = `<li>Nenhuma necessidade de ${tipo} registrada.</li>`;
            return;
        }

        necessidades.forEach(savedItem => {
            const listItem = document.createElement('li');
            listItem.className = "d-flex justify-content-between align-items-center";
            
            const itemText = document.createElement('span');
            let textContent = `${savedItem.item} (Prazo: ${savedItem.deadline})`;
            if (tipo === 'alimento' && savedItem.valorEstimado) {
                const restante = savedItem.quantidadeTotal - savedItem.quantidadeDoada;
                textContent = `${savedItem.item} - ${savedItem.quantidadeDoada}/${savedItem.quantidadeTotal} unidades (Faltam ${restante}) | Prazo: ${savedItem.deadline}`;
            }
            itemText.textContent = textContent;
            listItem.appendChild(itemText);

            const deleteButton = document.createElement('span');
            deleteButton.className = "btn-delete";
            deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="red" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1zm4 0A.5.5 0 0 1 10 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 1-1z"/><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm13 0A2 2 0 0 1 14 2V14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h13z"/></svg>';
            deleteButton.onclick = () => confirmAndRemoveSavedItem(savedItem, tipo);
            listItem.appendChild(deleteButton);

            savedList.appendChild(listItem);
        });

    } catch (error) {
        console.error(`Erro ao carregar lista de ${tipo}s:`, error);
        savedList.innerHTML = `<li>Erro ao carregar a lista.</li>`;
    }
}

async function confirmAndRemoveSavedItem(itemToRemove, tipo) {
    if (confirm(`Tem certeza que deseja remover a necessidade \"${itemToRemove.item}\"?`)) {
        const ongLogada = getUsuarioCorrente();
        if (!ongLogada || ongLogada.type !== 'ong') {
            alert("Ação não permitida.");
            return;
        }

        try {
            const ongData = await obterEntidadeAPI(ongLogada.id, 'ong');
            const key = tipo === 'alimento' ? 'necessidades_alimentos' : 'necessidades_voluntarios';
            
            const updatedNecessidades = (ongData[key] || []).filter(
                savedItem => savedItem.id !== itemToRemove.id
            );

            await atualizarEntidadeAPI(ongLogada.id, { [key]: updatedNecessidades }, 'ong');
            
            alert("Item removido com sucesso.");
            updateSavedList(tipo);

        } catch (error) {
            console.error("Erro ao remover item:", error);
            alert("Não foi possível remover o item.");
        }
    }
}

async function cleanupAndLoadNeeds() {
    const ongLogada = getUsuarioCorrente();
    if (!ongLogada || ongLogada.type !== 'ong') return;

    try {
        const ongData = await obterEntidadeAPI(ongLogada.id, 'ong');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const alimentosAtivos = (ongData.necessidades_alimentos || []).filter(n => new Date(n.deadline) >= hoje);
        const voluntariosAtivos = (ongData.necessidades_voluntarios || []).filter(n => new Date(n.deadline) >= hoje);

        const needsChanged = (ongData.necessidades_alimentos && alimentosAtivos.length !== ongData.necessidades_alimentos.length) ||
                             (ongData.necessidades_voluntarios && voluntariosAtivos.length !== ongData.necessidades_voluntarios.length);

        if (needsChanged) {
            await atualizarEntidadeAPI(ongLogada.id, {
                necessidades_alimentos: alimentosAtivos,
                necessidades_voluntarios: voluntariosAtivos
            }, 'ong');
        }

        updateSavedList('alimento');
        updateSavedList('voluntario');

    } catch (error) {
        console.error("Erro ao limpar necessidades expiradas:", error);
        alert("Não foi possível verificar e limpar as necessidades expiradas.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ongLogada = getUsuarioCorrente();
    const formContainer = document.querySelector('.form-container');

    if (!ongLogada || ongLogada.type !== 'ong') {
        formContainer.innerHTML = "<h1 class='text-center'>Acesso Negado</h1><p class='text-center'>Você precisa estar logado como uma ONG para acessar esta página.</p>";
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('alimento-deadline').setAttribute('min', today);
    document.getElementById('voluntario-deadline').setAttribute('min', today);

    toggleForm();
    cleanupAndLoadNeeds();
});