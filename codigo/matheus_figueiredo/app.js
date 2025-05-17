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

  // Carrega os dados salvos (ou inicia com array vazio)
  const usuarios = JSON.parse(localStorage.getItem('usuariosDB')) || [];

  // Verificação de duplicidade
  const emailExistente = usuarios.some(u => u.email === email);
  const cpfExistente = usuarios.some(u => u.cpf === cpf);

  if (emailExistente) {
    alert("Este e-mail já está cadastrado!");
    return;
  }

  if (cpfExistente) {
    alert("Este CPF já está cadastrado!");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  // Adiciona novo usuário
  usuarios.push({
    nome,
    email,
    cpf,
    senha,
    telefone,
    endereco,
    dataNascimento,
    genero
  });

  // Salva de volta no localStorage
  localStorage.setItem('usuariosDB', JSON.stringify(usuarios));

  alert("Cadastro realizado com sucesso!");
  form.reset();
});
