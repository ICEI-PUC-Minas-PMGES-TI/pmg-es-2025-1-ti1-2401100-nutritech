document.getElementById('cadastroForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const login = form.login.value.trim();
  const cpf = form.cpf.value.trim();
  const senha = form.senha.value;
  const confirmarSenha = form.confirmarSenha.value;
  const telefone = form.telefone.value.trim();
  const rua = form.rua.value.trim();
  const bairro = form.bairro.value.trim();
  const cidade = form.cidade.value.trim();
  const estado = form.estado.value.trim();
  const cep = form.cep.value.trim();
  const dataNascimento = form.dataNascimento.value;
  const genero = form.genero.value; 
  const fotoPerfilInput = form.fotoPerfil;

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  const processCadastro = (fotoPerfilBase64 = null) => {
    const novoUsuario = {
      nome,
      email,
      login,
      cpf,
      senha,
      telefone,
      endereco: { 
        logradouro: rua,
        numero: null,
        bairro: bairro,
        cidade: cidade,
        estado: estado,
        cep: cep
      },
      dataNascimento,
      genero,
      fotoPerfil: fotoPerfilBase64,
      doacoes: []
    };

    const baseURL = 'http://localhost:3001/usuarios';
    fetch(`${baseURL}?email=${email}`)
      .then(response => response.json())
      .then(usuariosEmail => {
        if (usuariosEmail.length > 0) {
          alert("Este e-mail já está cadastrado!");
          throw new Error('Email duplicado');
        }
        return fetch(`${baseURL}?login=${login}`);
      })
      .then(response => response.json())
      .then(usuariosLogin => {
        const existingUser = usuariosLogin.find(user => user.login === login);
        if (existingUser) {
          alert("Este nome de usuário já está em uso!");
          throw new Error('Login duplicado');
        }
        return fetch(`${baseURL}?cpf=${cpf}`);
      })
      .then(response => response.json())
      .then(usuariosCPF => {
        if (usuariosCPF.length > 0) {
          alert("Este CPF já está cadastrado!");
          throw new Error('CPF duplicado');
        }

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
        if (!['Email duplicado', 'CPF duplicado', 'Login duplicado'].includes(error.message)) {
          alert("Ocorreu um erro ao realizar o cadastro.");
        }
      });
  };

  if (fotoPerfilInput.files && fotoPerfilInput.files[0]) {
    const file = fotoPerfilInput.files[0];
    const reader = new FileReader();

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 300;
      const MAX_HEIGHT = 300;
      let width = image.width;
      let height = image.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      processCadastro(dataUrl);
      URL.revokeObjectURL(image.src);
    };

    image.onerror = () => {
      console.error('Erro ao carregar a imagem para redimensionamento.');
      alert('Erro ao processar a imagem de perfil. Tentando cadastrar sem imagem.');
      processCadastro('assets/images/usuario.png'); 
      URL.revokeObjectURL(image.src);
    };

    image.src = URL.createObjectURL(file);

  } else {
    processCadastro('assets/images/usuario.png');
  }
});
