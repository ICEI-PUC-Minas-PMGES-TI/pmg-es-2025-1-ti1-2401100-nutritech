const usuariosDB = {
  Usuarios: JSON.parse(localStorage.getItem('usuariosDB')) || [
    {
      Nome: "Henrique Silva",
      Email: "Henrique@gmail.com",
      CPF: "583.756.138-20",
      Senha: "Henrique1234",
      Telefone: "31-99867-8031",
      Endereco: "Rua das Flores, 123",
      DataNascimento: "1990-01-01",
      Genero: "masculino"
    }
  ]
};

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

  // Verificação de duplicidade
  const emailExistente = usuariosDB.Usuarios.some(u => u.Email === email);
  const cpfExistente = usuariosDB.Usuarios.some(u => u.CPF === cpf);

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

  usuariosDB.Usuarios.push({
    Nome: nome,
    Email: email,
    CPF: cpf,
    Senha: senha,
    Telefone: telefone,
    Endereco: endereco,
    DataNascimento: dataNascimento,
    Genero: genero
  });

  localStorage.setItem('usuariosDB', JSON.stringify(usuariosDB.Usuarios));

  alert("Cadastro realizado com sucesso!");

  form.reset();
});