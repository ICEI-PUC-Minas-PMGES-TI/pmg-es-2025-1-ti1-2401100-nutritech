document.getElementById('cadastroForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const login = form.login.value.trim(); // Added login field
  const cpf = form.cpf.value.trim();
  const senha = form.senha.value;
  const confirmarSenha = form.confirmarSenha.value;
  const telefone = form.telefone.value.trim();
  // Updated to collect individual address fields
  const rua = form.rua.value.trim();
  const bairro = form.bairro.value.trim();
  const cidade = form.cidade.value.trim();
  const estado = form.estado.value.trim();
  const cep = form.cep.value.trim();
  const dataNascimento = form.dataNascimento.value;
  const genero = form.genero.value; // This will get the value of the selected radio button

  // Validação das senhas
  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  const novoUsuario = {
    nome,
    email,
    login, // Added login to the user object
    cpf,
    senha,
    telefone,
    // Add new address fields to the object
    rua,
    bairro,
    cidade,
    estado,
    cep,
    dataNascimento,
    genero,
    doacoes: [] // Add an empty doacoes array for new users
  };

  const baseURL = 'http://localhost:3001/usuarios';

  // Verifica se já existe o e-mail
  fetch(`${baseURL}?email=${email}`)
    .then(response => response.json())
    .then(usuariosEmail => {
      if (usuariosEmail.length > 0) {
        alert("Este e-mail já está cadastrado!");
        throw new Error('Email duplicado');
      }
      // Verifica se já existe o login (username)
      return fetch(`${baseURL}?login=${login}`);
    })
    .then(response => response.json())
    .then(usuariosLogin => {
      // Refined check: explicitly find if a user with the exact login exists
      // This handles cases where the server might return all users if the 'login' field is new or missing from some records.
      const existingUser = usuariosLogin.find(user => user.login === login);
      if (existingUser) {
        alert("Este nome de usuário já está em uso!");
        throw new Error('Login duplicado');
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
      if (!['Email duplicado', 'CPF duplicado', 'Login duplicado'].includes(error.message)) {
        alert("Ocorreu um erro ao realizar o cadastro.");
      }
    });
});
