document.getElementById('form-voluntarios').addEventListener('submit', function (e) {
    e.preventDefault();

    const campos = this.querySelectorAll('input');
    let todosPreenchidos = true;

    campos.forEach(campo => {
        if (campo.value.trim() === '') {
            todosPreenchidos = false;
        }
    });

    if (todosPreenchidos) {
        const senha = this.querySelector('#senha').value;
        const confirmarSenha = this.querySelector('#confirmar-senha').value;
        const cpf = this.querySelector('#cpf').value;
        const telefone = this.querySelector('#telefone').value;

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        if (cpf.length < 14) { 
            alert('CPF inexistente. Tente novamente!');
            return;
        }

        if (telefone.length < 16){
            alert('Número de telefone inexistente. Tente novamente!');
            return;
        }

        if (senha.length < 4) {
            alert('Escolha uma senha com pelo menos 4 digitos!');
            return;
        }

        alert('Cadastro Realizado!');
        this.reset();
    } else {
        alert('Por favor, preencha todos os campos.');
    }
});