document.getElementById('form-cartao').addEventListener('submit', async function (e) {
    e.preventDefault();

    const campos = this.querySelectorAll('input');
    let todosPreenchidos = true;

    // Não validar o checkbox de recorrência como um campo que precisa ser preenchido
    campos.forEach(campo => {
        if (campo.type !== 'checkbox' && campo.value.trim() === '') {
            todosPreenchidos = false;
        }
    });

    if (todosPreenchidos) {
        try {
            const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
            if (!usuarioCorrenteJSON) {
                alert('Você precisa estar logado para doar.');
                return;
            }
            const usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
            const valor = document.getElementById('valor').value.replace(/[^0-9,\.]/g, '').replace(',', '.');
            const valorDoacao = parseFloat(valor);
            const isRecorrente = document.getElementById('recorrencia').checked;

            const urlParams = new URLSearchParams(window.location.search);
            const ongId = urlParams.get('ongId');
            if (!ongId) {
                alert('ONG não identificada.');
                return;
            }

            const ongResponse = await fetch(`http://localhost:3001/ongs/${ongId}`);
            if (!ongResponse.ok) throw new Error('ONG não encontrada');
            const ong = await ongResponse.json();

            const usuarioResponse = await fetch(`http://localhost:3001/usuarios/${usuarioCorrente.id}`);
            if (!usuarioResponse.ok) throw new Error('Usuário não encontrado');
            const usuarioAtual = await usuarioResponse.json();

            const userDoacoes = Array.isArray(usuarioAtual.doacoes) ? usuarioAtual.doacoes : [];
            const donationId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
            const dataHoje = new Date().toISOString().slice(0, 10);

            const donationUser = {
                donationId,
                recipientOngId: ongId,
                recipientOngNome: ong.nome || '',
                data: dataHoje,
                descricao: 'dinheiro',
                quantidade: '-',
                valor: valorDoacao,
                recorrencia: isRecorrente, // Adiciona o status da recorrência
                fonte: 'cartao.html'
            };

            const ongDoacoes = Array.isArray(ong.doacoes) ? ong.doacoes : [];
            const donationOng = {
                donationId,
                doadorId: usuarioCorrente.id,
                doadorNome: usuarioCorrente.nome,
                doadorTipo: usuarioCorrente.type,
                data: dataHoje,
                descricao: 'dinheiro',
                quantidade: '-',
                valor: valorDoacao,
                fonte: 'cartao.html'
            };

            usuarioAtual.doacoes = [...userDoacoes, donationUser];
            ong.doacoes = [...ongDoacoes, donationOng];

            await fetch(`http://localhost:3001/usuarios/${usuarioCorrente.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioAtual)
            });

            await fetch(`http://localhost:3001/ongs/${ongId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ong)
            });

            alert('Doação Realizada com sucesso!');
            this.reset();

        } catch (err) {
            alert('Erro ao registrar doação. Tente novamente.');
            console.error(err);
        }
    } else {
        alert('Por favor, preencha todos os campos.');
    }
});

document.getElementById('num-cartao').addEventListener('input', function () {
  let val = this.value.replace(/\D/g, '');
  // Garante que o valor não exceda 16 dígitos
  val = val.slice(0, 16);
  val = val.replace(/(.{4})/g, '$1 ').trim();
  document.getElementById('vis-numero').textContent = val || '0000 0000 0000 0000';
});


document.getElementById('titular').addEventListener('input', function () {
  document.getElementById('vis-nome').textContent = this.value.toUpperCase() || 'NOME DO TITULAR';
});


document.getElementById('validade').addEventListener('input', function () {
  // Garante que o valor não exceda 7 caracteres (MM/AAAA)
  let val = this.value.slice(0, 7);
  document.getElementById('vis-validade').textContent = val || 'MM/AAAA';
});

document.getElementById('cvv').addEventListener('focus', function () {
    document.querySelector('.cartao-visual').classList.add('flip');
});

document.getElementById('cvv').addEventListener('blur', function () {
    document.querySelector('.cartao-visual').classList.remove('flip');
});

document.getElementById('cvv').addEventListener('input', function () {
    let val = this.value.replace(/\D/g, '');
    val = val.slice(0, 3);
    document.getElementById('vis-cvv').textContent = val;
});