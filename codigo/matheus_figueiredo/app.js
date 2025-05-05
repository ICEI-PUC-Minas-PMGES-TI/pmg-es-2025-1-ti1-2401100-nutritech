const usuariosDB = {
    Usuarios: [
      {
        Nome: "Henrique Silva",
        Email: "Henrique@gmail.com",
        CPF: "583.756.138-20",
        Senha: "Henrique1234",
        Confirmar senha: "Henrique1234",
        Telefone: "31-99867-8031",
      }
    ]
  };
  
  document.getElementById('cadastroForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
   
    const inputs = e.target.elements;
    const nome = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const cpf = inputs[2].value.trim();
    const senha = inputs[3].value;
    const confirmarSenha = inputs[4].value;
    const telefone = inputs[5].value.trim();
  
    
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
  
    
    alert("Cadastro realizado com sucesso!");
  
   
    usuariosDB.Usuarios.push({
      Nome: nome,
      Email: email,
      Senha: senha,
      CPF: cpf,
      Telefone: telefone
    });
  
    
    e.target.reset();
  });