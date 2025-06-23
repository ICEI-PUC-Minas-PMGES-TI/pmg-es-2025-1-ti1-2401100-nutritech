const baseUrl = 'http://localhost:3001';

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    ongId: params.get('ongId'),
    userId: params.get('userId')
  };
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao buscar dados da URL: ${url}`);
  return res.json();
}

function fillCheckboxes(voluntario) {
  if (!voluntario || !voluntario.diasTurnos) return;

  for (const dia in voluntario.diasTurnos) {
    voluntario.diasTurnos[dia].forEach(turno => {
      const cb = document.querySelector(`input[name="${dia}-${turno}"]`);
      if (cb) cb.checked = true;
    });
  }

  if(voluntario.areasInteresse) {
    voluntario.areasInteresse.forEach(area => {
        const cb = document.querySelector(`input[name="area-interesse"][value="${area}"]`);
        if (cb) cb.checked = true;
    });
  }
}

function getCheckedValues() {
  const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
  const turnos = ['manha', 'tarde', 'noite'];
  const disponibilidade = {};

  dias.forEach(dia => {
    const turnosSelecionados = turnos.filter(turno => {
      const cb = document.querySelector(`input[name="${dia}-${turno}"]`);
      return cb?.checked;
    });
    if (turnosSelecionados.length) disponibilidade[dia] = turnosSelecionados;
  });

  const areas = Array.from(document.querySelectorAll('input[name="area-interesse"]:checked'))
    .map(cb => cb.value);

  return { disponibilidade, areas };
}

async function saveVoluntariado(ongId, userId, disponibilidade, areas) {
    try {
        const ong = await fetchJson(`${baseUrl}/ongs/${ongId}`);
        let voluntarioExistente = ong.voluntarios.find(v => v.id === Number(userId));

        if (voluntarioExistente) {
            // Atualiza voluntário existente
            voluntarioExistente.diasTurnos = disponibilidade;
            voluntarioExistente.areasInteresse = areas;
        } else {
            // Adiciona novo voluntário
            ong.voluntarios.push({
                id: Number(userId),
                diasTurnos: disponibilidade,
                areasInteresse: areas
            });
        }

        await fetch(`${baseUrl}/ongs/${ongId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voluntarios: ong.voluntarios })
        });

        alert('Voluntariado confirmado com sucesso!');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Erro ao salvar dados de voluntariado:', error);
        alert('Não foi possível salvar seus dados. Tente novamente.');
    }
}


window.addEventListener('DOMContentLoaded', async () => {
  const { ongId, userId } = getUrlParams();
  const usuarioCorrente = JSON.parse(sessionStorage.getItem('usuarioCorrente'));

  if (!usuarioCorrente || !usuarioCorrente.id || usuarioCorrente.id.toString() !== userId) {
      alert('Acesso negado. Você precisa estar logado com o usuário correto.');
      window.location.href = 'login.html';
      return;
  }

  if (!ongId || !userId) {
    alert('ID da ONG ou do usuário não informado na URL');
    window.location.href = 'voluntariado_ongs.html';
    return;
  }

  try {
    const ong = await fetchJson(`${baseUrl}/ongs/${ongId}`);
    document.getElementById('ong-name').textContent = `Para a ONG: ${ong.nome}`;

    const voluntario = ong.voluntarios.find(v => v.id === Number(userId));
    if (voluntario) {
        fillCheckboxes(voluntario);
    }

    document.getElementById('form-voluntarios').addEventListener('submit', async e => {
      e.preventDefault();
      const { disponibilidade, areas } = getCheckedValues();
      await saveVoluntariado(ongId, userId, disponibilidade, areas);
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});
