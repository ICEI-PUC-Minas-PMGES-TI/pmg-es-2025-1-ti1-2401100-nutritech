document.addEventListener('DOMContentLoaded', () => {
    // Tentar diferentes chaves de sessão para compatibilidade
    let currentUser = null;
    try {
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    } catch (e) {
        console.log('Erro ao fazer parse de currentUser do sessionStorage');
    }
    
    if (!currentUser) {
        try {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        } catch (e) {
            console.log('Erro ao fazer parse de currentUser do localStorage');
        }
    }
    
    if (!currentUser) {
        try {
            currentUser = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
        } catch (e) {
            console.log('Erro ao fazer parse de usuarioCorrente do sessionStorage');
        }
    }
    
    if (!currentUser || (currentUser.type !== 'user' && currentUser.type !== 'admin')) {
        alert('Você precisa fazer login para acessar esta página.');
        window.location.href = '../login/login.html';
        return;
    }

    const form = document.getElementById('editProfileForm');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const cpfInput = document.getElementById('cpf');
    const dataNascimentoInput = document.getElementById('dataNascimento');
    const imageInput = document.getElementById('profileImage');
    const imagePreview = document.getElementById('imagePreview'); // Elemento que será criado
    const cancelButton = document.getElementById('cancelButton');
    const pageTitle = document.querySelector('h2');

    const userId = currentUser.id;
    
    if (!userId) {
        alert('Erro: ID do usuário não encontrado. Faça login novamente.');
        window.location.href = '../login/login.html';
        return;
    }

    // Carregar dados do usuário da API
    fetch(window.getApiUrl(`usuarios/${userId}`))
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(user => {
            if (!user) {
                throw new Error('Usuário não encontrado');
            }
            
            console.log('Dados do usuário carregados:', user);
            
            // Preencher todos os campos do formulário
            if (nomeInput) {
                nomeInput.value = user.nome || '';
            }
            if (emailInput) {
                emailInput.value = user.email || '';
            }
            if (telefoneInput) {
                telefoneInput.value = user.telefone || '';
            }
            if (cpfInput) {
                cpfInput.value = user.cpf || '';
            }
            if (dataNascimentoInput) {
                dataNascimentoInput.value = user.dataNascimento || '';
            }
            
            if (pageTitle && user.nome) {
                pageTitle.textContent = `Editar Perfil de ${user.nome}`;
            }
            
            // Carregar imagem de perfil se existir
            if (user.fotoPerfil && imagePreview) {
                imagePreview.src = user.fotoPerfil;
                imagePreview.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados do usuário:', error);
            alert(`Não foi possível carregar os dados do usuário: ${error.message}`);
        });

    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file && imagePreview) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const file = imageInput ? imageInput.files[0] : null;
            const nome = nomeInput ? nomeInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const telefone = telefoneInput ? telefoneInput.value : '';
            const cpf = cpfInput ? cpfInput.value : '';
            const dataNascimento = dataNascimentoInput ? dataNascimentoInput.value : '';

            let imageData = null;
            if (file) {
                try {
                    imageData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(file);
                    });
                } catch (error) {
                    console.error('Erro ao ler o arquivo de imagem:', error);
                    alert('Não foi possível ler o arquivo de imagem.');
                    return;
                }
            }

            const updatedData = {
                nome: nome,
                email: email,
                telefone: telefone,
                cpf: cpf,
                dataNascimento: dataNascimento
            };

            if (imageData) {
                updatedData.fotoPerfil = imageData;
            }

            try {
                const response = await fetch(window.getApiUrl(`usuarios/${userId}`), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    alert('Perfil atualizado com sucesso!');
                    const updatedUser = { 
                        ...currentUser, 
                        nome: nome,
                        email: email,
                        telefone: telefone,
                        cpf: cpf,
                        dataNascimento: dataNascimento
                    };
                    if(imageData) updatedUser.fotoPerfil = imageData;
                    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    window.location.href = 'perfil_usuario.html';
                } else {
                    const errorText = await response.text();
                    throw new Error(`Falha na atualização: ${response.status} ${response.statusText} - ${errorText}`);
                }
            } catch (error) {
                console.error('Erro ao atualizar o perfil:', error);
                alert('Ocorreu um erro ao atualizar o perfil. Verifique o console para mais detalhes.');
            }
        });
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = 'perfil_usuario.html';
        });
    }
});
