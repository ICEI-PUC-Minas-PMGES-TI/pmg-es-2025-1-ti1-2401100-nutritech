document.addEventListener('DOMContentLoaded', async () => {
    const ongsTableBody = document.querySelector('#ongsTable tbody');

    if (!ongsTableBody) {
        console.error('Elemento tbody da tabela de ONGs não encontrado.');
        return;
    }

    try {
        const response = await fetch(window.getApiUrl('ongs'));
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
                    let currentUser = null;
                    try {
                        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
                    } catch (e) {
                        console.log('Erro ao fazer parse de currentUser do sessionStorage');
                    }
                    
                    if (!currentUser) {
                        try {
                            currentUser = JSON.parse(localStorage.getItem('currentUser'));
                        } catch (e) {
                            console.log('Erro ao fazer parse de currentUser do localStorage');
                        }
                    }
                    
                    if (!currentUser) {
                        try {
                            currentUser = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
                        } catch (e) {
                            console.log('Erro ao fazer parse de usuarioCorrente do sessionStorage');
                        }
                    }

                    if (currentUser && currentUser.id) {
                        window.location.href = `cadastro_voluntarios.html?ongId=${ong.id}&userId=${currentUser.id}`;
                    } else {
                        alert('Você precisa estar logado para se voluntariar. Redirecionando para a página de login.');
                        window.location.href = '../login/login.html';
                    }
                });

                const imgCell = document.createElement('td');
                const img = document.createElement('img');
                img.src = ong.imagem || '../../assets/images/logo.png';
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
