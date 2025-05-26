document.getElementById('form-cartao').addEventListener('submit', function (e) {
    e.preventDefault();

    const campos = this.querySelectorAll('input');
    let todosPreenchidos = true;

    campos.forEach(campo => {
        if (campo.value.trim() === '') {
            todosPreenchidos = false;
        }
    });

    if (todosPreenchidos) {
        alert('Doação Realizada!');
        this.reset();
    } else {
        alert('Por favor, preencha todos os campos.');
    }
});

// Atualiza número do cartão
document.getElementById('num-cartao').addEventListener('input', function () {
  let val = this.value.replace(/\D/g, '');
  val = val.replace(/(.{4})/g, '$1 ').trim(); // adiciona espaços
  document.getElementById('vis-numero').textContent = val || '0000 0000 0000 0000';
});

// Atualiza nome
document.getElementById('titular').addEventListener('input', function () {
  document.getElementById('vis-nome').textContent = this.value.toUpperCase() || 'NOME DO TITULAR';
});

// Atualiza validade
document.getElementById('validade').addEventListener('input', function () {
  document.getElementById('vis-validade').textContent = this.value || 'MM/AAAA';
});