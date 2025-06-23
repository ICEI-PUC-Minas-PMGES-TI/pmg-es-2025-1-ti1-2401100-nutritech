document.getElementById('form-cartao').addEventListener('submit', async function (e) {
    e.preventDefault();

    const campos = this.querySelectorAll('input');
    let todosPreenchidos = true;

    campos.forEach(campo => {
        if (campo.value.trim() === '') {
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
            const urlParams = new URLSearchParams(window.location.search);
            const ongId = urlParams.get('ongId');
            if (!ongId) {
                alert('ONG não identificada.');
                return;
            }
            const ong = await fetch('http://localhost:3001/ongs/' + ongId).then(res => res.json());
            const ongNome = ong.nome || '';
            const ongDoacoes = Array.isArray(ong.doacoes) ? ong.doacoes : [];
            const usuarioAtual = await fetch('http://localhost:3001/usuarios/' + usuarioCorrente.id).then(res => res.json());
            const userDoacoes = Array.isArray(usuarioAtual.doacoes) ? usuarioAtual.doacoes : [];
            const donationId = Date.now().toString() + Math.floor(Math.random()*10000).toString();
            const dataHoje = new Date().toISOString().slice(0,10);
            const donationUser = {
                donationId,
                recipientOngId: ongId,
                recipientOngNome: ongNome,
                data: dataHoje,
                descricao: 'dinheiro',
                quantidade: '-',
                valor: valorDoacao,
                fonte: 'cartao.html'
            };
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
            await fetch('http://localhost:3001/usuarios/' + usuarioCorrente.id, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doacoes: [...userDoacoes, donationUser]
                })
            });
            await fetch('http://localhost:3001/ongs/' + ongId, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doacoes: [...ongDoacoes, donationOng]
                })
            });
            alert('Doação Realizada!');
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
  val = val.replace(/(.{4})/g, '$1 ').trim();
  document.getElementById('vis-numero').textContent = val || '0000 0000 0000 0000';
});


document.getElementById('titular').addEventListener('input', function () {
  document.getElementById('vis-nome').textContent = this.value.toUpperCase() || 'NOME DO TITULAR';
});


document.getElementById('validade').addEventListener('input', function () {
  document.getElementById('vis-validade').textContent = this.value || 'MM/AAAA';
});