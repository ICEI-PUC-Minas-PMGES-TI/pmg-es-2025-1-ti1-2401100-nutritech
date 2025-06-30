document.addEventListener("DOMContentLoaded", async function () {
    const listaVoluntarios = document.getElementById("listaVoluntarios");
    const ongNameTitle = document.getElementById("ong-name-title");
    const params = new URLSearchParams(window.location.search);
    const ongId = params.get('id');

    if (!ongId) {
        ongNameTitle.textContent = "ID da ONG não fornecido.";
        return;
    }

    const API_URL = window.getApiUrl(`ongs/${ongId}`);

    async function carregarVoluntarios() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Não foi possível carregar os dados da ONG.');
            }
            const ong = await response.json();

            ongNameTitle.textContent = `Voluntários da ${ong.nome || 'ONG'}`;
            listaVoluntarios.innerHTML = '';

            if (ong.voluntarios && ong.voluntarios.length > 0) {
                ong.voluntarios.forEach(voluntario => {
                    const li = document.createElement("li");
                    li.className = "list-group-item d-flex justify-content-between align-items-center";

                    const dias = voluntario.dias_disponiveis && voluntario.dias_disponiveis.length > 0 ?
                        `<small>Dias: ${voluntario.dias_disponiveis.join(', ')}</small><br>` : '';
                    const areas = voluntario.areasInteresse && voluntario.areasInteresse.length > 0 ?
                        `<small>Áreas: ${voluntario.areasInteresse.join(', ')}</small>` : '';

                    li.innerHTML = `
                        <div>
                            <strong>${voluntario.nome || 'Nome não informado'}</strong><br>
                            ${dias}
                            ${areas}
                        </div>
                        <button class="btn btn-danger btn-sm" data-voluntario-id="${voluntario.id}">Remover</button>
                    `;
                    listaVoluntarios.appendChild(li);
                });
            } else {
                listaVoluntarios.innerHTML = '<li class="list-group-item">Nenhum voluntário cadastrado para esta ONG.</li>';
            }
        } catch (error) {
            console.error("Erro ao carregar voluntários:", error);
            ongNameTitle.textContent = "Erro ao carregar voluntários.";
        }
    }

    async function removerVoluntario(voluntarioId) {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro ao buscar dados da ONG.');
            const ong = await response.json();

            const novosVoluntarios = ong.voluntarios.filter(v => v.id.toString() !== voluntarioId.toString());

            const updateResponse = await fetch(API_URL, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ voluntarios: novosVoluntarios }),
            });

            if (!updateResponse.ok) {
                throw new Error('Erro ao remover o voluntário.');
            }

            await carregarVoluntarios();
            alert('Voluntário removido com sucesso!');

        } catch (error) {
            console.error("Erro ao remover voluntário:", error);
            alert(error.message);
        }
    }

    listaVoluntarios.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-danger')) {
            const voluntarioId = event.target.getAttribute('data-voluntario-id');
            if (confirm('Tem certeza que deseja remover este voluntário?')) {
                removerVoluntario(voluntarioId);
            }
        }
    });

    carregarVoluntarios();
});



