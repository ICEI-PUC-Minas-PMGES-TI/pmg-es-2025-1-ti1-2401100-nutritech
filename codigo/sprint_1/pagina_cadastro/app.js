document.getElementById('cadastroForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const cpf = form.cpf.value.trim();
  const senha = form.senha.value;
  const confirmarSenha = form.confirmarSenha.value;
  const telefone = form.telefone.value.trim();
  const endereco = form.endereco.value.trim();
  const dataNascimento = form.dataNascimento.value;
  const genero = form.genero.value;

  // Validação das senhas
  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  const novoUsuario = {
    nome,
    email,
    cpf,
    senha,
    telefone,
    endereco,
    dataNascimento,
    genero
  };

  const baseURL = 'http://localhost:3000/usuarios';

  // Verifica se já existe o e-mail
  fetch(`${baseURL}?email=${email}`)
    .then(response => response.json())
    .then(usuariosEmail => {
      if (usuariosEmail.length > 0) {
        alert("Este e-mail já está cadastrado!");
        throw new Error('Email duplicado');
      }

      // Verifica se já existe o CPF
      return fetch(`${baseURL}?cpf=${cpf}`);
    })
    .then(response => response.json())
    .then(usuariosCPF => {
      if (usuariosCPF.length > 0) {
        alert("Este CPF já está cadastrado!");
        throw new Error('CPF duplicado');
      }

      // Cadastra o novo usuário
      return fetch(baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoUsuario)
      });
    })
    .then(response => {
      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        form.reset();
      } else {
        alert("Erro ao cadastrar usuário.");
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      // Evita mostrar erro se foi duplicata detectada
      if (!['Email duplicado', 'CPF duplicado'].includes(error.message)) {
        alert("Ocorreu um erro ao realizar o cadastro.");
      }
    });
});
