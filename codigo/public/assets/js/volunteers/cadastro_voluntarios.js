const baseUrl = 'http://localhost:3001';

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    ongId: params.get('ongId'),
  };
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error fetching data from URL: ${url}`);
  return res.json();
}

async function saveVoluntariado(ongId, userId, diasDisponiveis, areas, nomeVoluntario, telefoneVoluntario) {
    try {
        const ong = await fetchJson(`${baseUrl}/ongs/${ongId}`);
        const voluntarioExistente = ong.voluntarios.find(v => v.id === Number(userId));

        if (voluntarioExistente) {
            voluntarioExistente.dias_disponiveis = diasDisponiveis;
            voluntarioExistente.areasInteresse = areas;
        } else {

            ong.voluntarios.push({
                id: Number(userId),
                nome: nomeVoluntario,
                telefone: telefoneVoluntario,
                dias_disponiveis: diasDisponiveis,
                areasInteresse: areas
            });
        }


        const response = await fetch(`${baseUrl}/ongs/${ongId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voluntarios: ong.voluntarios })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to save volunteer data. Status: ${response.status}, Body: ${errorBody}`);
        }

        alert('Volunteering confirmed successfully!');
        window.location.href = '../user/perfil_usuario.html';

    } catch (error) {
        console.error('Error saving volunteer data:', error);
        alert('Could not save your data. Please try again.');
    }
}


window.addEventListener('DOMContentLoaded', async () => {
  const { ongId } = getUrlParams();
  const usuarioCorrente = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));
  const userId = usuarioCorrente ? usuarioCorrente.id : null;

  if (!usuarioCorrente || !userId) {
      alert('Access denied. You must be logged in.');
      window.location.href = '../login/login.html';
      return;
  }

  if (!ongId) {
    alert('ONG ID not provided in the URL.');
    window.location.href = 'voluntariado_ongs.html';
    return;
  }

  try {

    const ong = await fetchJson(`${baseUrl}/ongs/${ongId}`);
    document.getElementById('ong-name').textContent = `Seja um voluntário na ONG: ${ong.nome}`;
    const voluntario = ong.voluntarios?.find(v => v.id === Number(userId));

    const fp = flatpickr("#dias_disponiveis", {
        mode: "multiple",
        dateFormat: "d/m/Y",
        minDate: "today",
    });

    if (voluntario) {
        if (voluntario.dias_disponiveis) {

            const datesForPicker = voluntario.dias_disponiveis.map(d => d.split('/').reverse().join('-'));
            fp.setDate(datesForPicker);
        }
        if (voluntario.areasInteresse) {
            voluntario.areasInteresse.forEach(area => {
                const cb = document.querySelector(`input[name="area-interesse"][value="${area}"]`);
                if (cb) cb.checked = true;
            });
        }
    }

    document.getElementById('form-voluntarios').addEventListener('submit', async (e) => {
        e.preventDefault();

        const diasDisponiveis = document.getElementById('dias_disponiveis')._flatpickr.selectedDates.map(date => {
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            return `${d}/${m}/${y}`;
        });

        const areas = Array.from(document.querySelectorAll('input[name="area-interesse"]:checked')).map(cb => cb.value);

        if (diasDisponiveis.length === 0) {
            alert('Por favor, selecione pelo menos um dia disponível.');
            return;
        }

        if (areas.length === 0) {
            alert('Por favor, selecione pelo menos uma área de interesse.');
            return;
        }

        const userData = await fetchJson(`${baseUrl}/usuarios/${userId}`);
        await saveVoluntariado(ongId, userId, diasDisponiveis, areas, userData.nome, userData.telefone);
    });

  } catch (error) {
    console.error('Erro ao carregar a página:', error);
    alert('Erro ao carregar as informações. Tente novamente.');
  }
});
