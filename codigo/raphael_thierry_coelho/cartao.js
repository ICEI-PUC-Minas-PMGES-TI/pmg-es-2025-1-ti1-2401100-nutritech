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