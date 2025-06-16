document.addEventListener('DOMContentLoaded', async () => {
    const ongsTableBody = document.querySelector('#ongsTable tbody');

    if (!ongsTableBody) {
        console.error('Elemento tbody da tabela de ONGs não encontrado.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/ongs');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ao buscar ONGs.`);
        }
        const ongs = await response.json();

        if (ongs && ongs.length > 0) {
            ongsTableBody.innerHTML = '';
            ongs.forEach(ong => {
                if (!ong.id || !ong.nome) {
                    console.warn('ONG com dados incompletos foi pulada:', ong);
                    return; 
                }

                const row = document.createElement('tr');
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => {
                    window.location.href = `/public/perfildaong.html?id=${ong.id}`;
                });

                const imgCell = document.createElement('td');
                const img = document.createElement('img');
                img.src = ong.imagem || 'assets/images/placeholder.png';
                img.alt = `Logo de ${ong.nome}`;
                img.className = 'ong-table-img'; 
                imgCell.appendChild(img);

                const nameCell = document.createElement('td');
                nameCell.textContent = ong.nome;

                const descriptionCell = document.createElement('td');
                const maxLength = 150;
                let descriptionText = ong.descricao || 'Descrição não disponível.';
                if (descriptionText.length > maxLength) {
                    descriptionText = descriptionText.substring(0, maxLength) + '...';
                }
                descriptionCell.textContent = descriptionText;

                row.appendChild(imgCell);
                row.appendChild(nameCell);
                row.appendChild(descriptionCell);
                ongsTableBody.appendChild(row);
            });
        } else {
            ongsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhuma ONG encontrada.</td></tr>';
        }
    } catch (error) {
        console.error('Erro ao carregar ou processar dados das ONGs:', error);
        ongsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">Não foi possível carregar as ONGs. Tente novamente mais tarde.</td></tr>';
    }
});
