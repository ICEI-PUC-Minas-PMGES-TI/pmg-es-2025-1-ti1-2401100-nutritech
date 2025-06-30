document.addEventListener('DOMContentLoaded', () => {
    const doacaoParaEditarJSON = sessionStorage.getItem('doacaoParaEditar');
    if (doacaoParaEditarJSON) {
        const doacao = JSON.parse(doacaoParaEditarJSON);

        const valorNumerico = parseFloat(doacao.valor);
        if (!isNaN(valorNumerico)) {
            document.getElementById('valor').value = valorNumerico.toFixed(2).replace('.', ',');
        } else {
            document.getElementById('valor').value = '0,00';
        }
        
        document.getElementById('recorrencia').checked = doacao.recorrencia;

        document.querySelector('.container h1').textContent = 'Editar Doação Recorrente';
        document.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';

        const ongInfoDiv = document.createElement('div');
        ongInfoDiv.innerHTML = `<h3>Editando doação para: <strong>${doacao.recipientOngNome}</strong></h3>`;
        ongInfoDiv.style.textAlign = 'center';
        ongInfoDiv.style.marginBottom = '20px';
        const form = document.getElementById('form-cartao');
        form.parentNode.insertBefore(ongInfoDiv, form);
    }
});

document.getElementById('form-cartao').addEventListener('submit', async function (e) {
    e.preventDefault();

    const campos = this.querySelectorAll('input');
    let todosPreenchidos = true;
    campos.forEach(campo => {
        if (campo.type !== 'checkbox' && campo.value.trim() === '') {
            todosPreenchidos = false;
        }
    });

    if (!todosPreenchidos) {
        alert('Por favor, preencha todos os campos do cartão.');
        return;
    }

    const doacaoParaEditarJSON = sessionStorage.getItem('doacaoParaEditar');
    const isEditing = !!doacaoParaEditarJSON;

    if (isEditing) {
        try {
            const doacaoParaEditar = JSON.parse(doacaoParaEditarJSON);
            const usuarioCorrenteJSON = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
            if (!usuarioCorrenteJSON) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '../login/login.html';
                return;
            }
            const usuarioCorrente = JSON.parse(usuarioCorrenteJSON);

            const [usuarioResponse, ongResponse] = await Promise.all([
                fetch(window.getApiUrl(`usuarios/${usuarioCorrente.id}`)),
                fetch(window.getApiUrl(`ongs/${doacaoParaEditar.recipientOngId}`))
            ]);

            if (!usuarioResponse.ok || !ongResponse.ok) {
                throw new Error('Não foi possível carregar os dados do usuário ou da ONG.');
            }

            const usuarioAtual = await usuarioResponse.json();
            const ong = await ongResponse.json();

            const userDonationIndex = usuarioAtual.doacoes.findIndex(d => d.donationId === doacaoParaEditar.donationId);
            const ongDonationIndex = ong.doacoes.findIndex(d => d.donationId === doacaoParaEditar.donationId);

            if (userDonationIndex === -1) {
                throw new Error('Doação não encontrada nos registros do usuário.');
            }

            const valorInput = document.getElementById('valor').value;
            const valorLimpo = valorInput.replace(/[^0-9,]/g, '').replace(',', '.');
            const novoValor = parseFloat(valorLimpo);

            if (isNaN(novoValor) || novoValor <= 0) {
                alert('O valor da doação é inválido. Por favor, insira um valor maior que zero.');
                return;
            }

            const novaRecorrencia = document.getElementById('recorrencia').checked;

            usuarioAtual.doacoes[userDonationIndex].valor = novoValor;
            usuarioAtual.doacoes[userDonationIndex].recorrencia = novaRecorrencia;
            usuarioAtual.doacoes[userDonationIndex].data = new Date().toISOString().slice(0, 10);

            if (ongDonationIndex !== -1) {
                ong.doacoes[ongDonationIndex].valor = novoValor;
                ong.doacoes[ongDonationIndex].data = new Date().toISOString().slice(0, 10);
            }

            await Promise.all([
                fetch(window.getApiUrl(`usuarios/${usuarioCorrente.id}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuarioAtual)
                }),
                fetch(window.getApiUrl(`ongs/${doacaoParaEditar.recipientOngId}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ong)
                })
            ]);

            alert('Doação atualizada com sucesso!');
            sessionStorage.removeItem('doacaoParaEditar');
            window.location.href = 'gerenciar_recorrencias.html';

        } catch (err) {
            alert('Erro ao atualizar doação. Tente novamente.');
            console.error(err);
        }

    } else {
        try {
            const usuarioCorrenteJSON = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
            if (!usuarioCorrenteJSON) {
                alert('Você precisa estar logado para doar.');
                return;
            }
            const usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
            const valorInput = document.getElementById('valor').value;
            const valorLimpo = valorInput.replace(/[^0-9,]/g, '').replace(',', '.');
            const valorDoacao = parseFloat(valorLimpo);

            if (isNaN(valorDoacao) || valorDoacao <= 0) {
                alert('O valor da doação é inválido. Por favor, insira um valor maior que zero.');
                return;
            }

            const isRecorrente = document.getElementById('recorrencia').checked;
            console.log('Checkbox recorrência marcado:', isRecorrente);

            const urlParams = new URLSearchParams(window.location.search);
            const ongId = urlParams.get('ongId');
            if (!ongId) {
                alert('ONG não identificada.');
                return;
            }

            const ongResponse = await fetch(window.getApiUrl(`ongs/${ongId}`));
            if (!ongResponse.ok) throw new Error('ONG não encontrada');
            const ong = await ongResponse.json();

            const usuarioResponse = await fetch(window.getApiUrl(`usuarios/${usuarioCorrente.id}`));
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
                recorrencia: isRecorrente,
                fonte: 'cartao.html'
            };

            console.log('Objeto de doação criado:', donationUser);

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

            await fetch(window.getApiUrl(`usuarios/${usuarioCorrente.id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioAtual)
            });

            await fetch(window.getApiUrl(`ongs/${ongId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ong)
            });

            alert('Doação Realizada com sucesso!');
            this.reset();
            window.location.href = 'gerenciar_recorrencias.html';

        } catch (err) {
            alert('Erro ao registrar doação. Tente novamente.');
            console.error(err);
        }
    }
});

document.getElementById('num-cartao').addEventListener('input', function () {
  let val = this.value.replace(/\D/g, '');
  val = val.slice(0, 16);

  val = val.replace(/(.{4})/g, '$1 ').trim();
  
  this.value = val;
  
  document.getElementById('vis-numero').textContent = val || '0000 0000 0000 0000';
});


document.getElementById('titular').addEventListener('input', function () {
  document.getElementById('vis-nome').textContent = this.value.toUpperCase() || 'NOME DO TITULAR';
});


document.getElementById('validade').addEventListener('input', function () {
  let val = this.value.replace(/\D/g, '');
  // Garante que o valor não exceda 6 dígitos
  val = val.slice(0, 6);
  
  // Formatação: MM/AAAA (2 dígitos, barra, 4 dígitos)
  if (val.length >= 3) {
    val = val.slice(0, 2) + '/' + val.slice(2);
  }
  
  // Atualiza o valor do input
  this.value = val;
  
  // Atualiza a visualização do cartão
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
    // Garante que o CVV tenha no máximo 3 dígitos
    val = val.slice(0, 3);
    
    // Atualiza o valor do input
    this.value = val;
    
    // Atualiza a visualização do cartão
    document.getElementById('vis-cvv').textContent = val;
});

// Formatação do CPF
document.getElementById('cpf').addEventListener('input', function () {
    let val = this.value.replace(/\D/g, '');
    // Garante que o CPF tenha no máximo 11 dígitos
    val = val.slice(0, 11);
    
    // Formatação: XXX.XXX.XXX-XX
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    // Atualiza o valor do input
    this.value = val;
});

// Formatação do valor da doação
document.getElementById('valor').addEventListener('input', function () {
    let val = this.value.replace(/\D/g, '');
    
    if (val === '') {
        this.value = '';
        return;
    }
    
    // Converte para centavos e depois para formato de moeda
    val = (parseInt(val) / 100).toFixed(2);
    val = val.replace('.', ',');
    val = val.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Adiciona o símbolo R$
    this.value = 'R$ ' + val;
});

document.getElementById('recorrencia').addEventListener('change', function() {
    console.log('Estado do checkbox recorrência:', this.checked);
});