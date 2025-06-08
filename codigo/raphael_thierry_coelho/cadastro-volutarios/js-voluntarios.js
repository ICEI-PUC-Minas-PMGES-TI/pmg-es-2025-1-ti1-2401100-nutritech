const baseUrl = 'http://localhost:3000'; // URL do JSON Server
const ongId = 1; // ID fixo da ONG

function getUserIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar dados');
  return res.json();
}

function fillForm(user) {
  ['nome', 'telefone', 'email', 'cpf'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = user[id] || '';
  });
}

function fillCheckboxes(voluntario) {
  if (!voluntario) return;

  // Disponibilidade
  for (const dia in voluntario.diasTurnos) {
    voluntario.diasTurnos[dia].forEach(turno => {
      const cb = document.querySelector(`input[name="${dia}-${turno}"]`);
      if (cb) cb.checked = true;
    });
  }

  // Áreas de interesse
  voluntario.areasInteresse.forEach(area => {
    const cb = document.querySelector(`input[name="area-interesse"][value="${area}"]`);
    if (cb) cb.checked = true;
  });
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

// Função para criar voluntário novo na ONG
async function createVoluntario(voluntarios, userId) {
  const novoVoluntario = {
    id: Number(userId),
    diasTurnos: {},
    areasInteresse: []
  };
  voluntarios.push(novoVoluntario);

  // Atualiza no backend
  await fetch(`${baseUrl}/ongs/${ongId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voluntarios })
  });

  return novoVoluntario;
}

async function updateVoluntario(voluntarios, userId, diasTurnos, areasInteresse) {
  let idx = voluntarios.findIndex(v => v.id === Number(userId));

  // Se não existir, cria voluntário novo
  if (idx === -1) {
    await createVoluntario(voluntarios, userId);
    idx = voluntarios.findIndex(v => v.id === Number(userId));
  }

  voluntarios[idx].diasTurnos = diasTurnos;
  voluntarios[idx].areasInteresse = areasInteresse;

  await fetch(`${baseUrl}/ongs/${ongId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voluntarios })
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  const userId = getUserIdFromUrl();
  if (!userId) {
    alert('ID do usuário não informado na URL');
    return;
  }

  try {
    const user = await fetchJson(`${baseUrl}/usuarios/${userId}`);
    fillForm(user);

    const ong = await fetchJson(`${baseUrl}/ongs/${ongId}`);

    let voluntario = ong.voluntarios.find(v => v.id === Number(userId));

    // Se voluntário não existir, cria a estrutura
    if (!voluntario) {
      voluntario = await createVoluntario(ong.voluntarios, userId);
    }

    fillCheckboxes(voluntario);

    document.getElementById('form-voluntarios').addEventListener('submit', async e => {
      e.preventDefault();
      const { disponibilidade, areas } = getCheckedValues();
      await updateVoluntario(ong.voluntarios, userId, disponibilidade, areas);
      alert('Cadastro atualizado com sucesso!');
    });
  } catch (err) {
    alert(err.message);
  }
});
