// Trabalho Interdisciplinar 1 - Aplicações Web
//
// Esse módulo realiza o registro de novos usuários e login para aplicações com 
// backend baseado em API REST provida pelo JSONServer
// Os dados de usuário estão localizados no arquivo db.json que acompanha este projeto.
//
// Autor: Rommel Vieira Carneiro (rommelcarneiro@gmail.com)
// Data: 09/09/2024
//
// Código LoginApp  

const LOGIN_URL = "/modulos/login/login.html";
const RETURN_URL = "/index.html";
const USER_PROFILE_URL = "/modulos/user/perfil_usuario.html";
const ONG_PROFILE_URL = "/modulos/ong/perfildaong.html";

// Função para calcular o caminho relativo correto para index.html
function getIndexPath() {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    // Se estamos na raiz ou em /codigo/public/
    if (pathSegments.length <= 2 || currentPath.includes('/codigo/public/index.html')) {
        return './index.html';
    }
    
    // Se estamos em um subdiretório (como /modulos/user/login.html)
    // Contar quantos níveis precisamos subir
    let levelsUp = 0;
    for (let i = pathSegments.length - 1; i >= 0; i--) {
        if (pathSegments[i] === 'public') {
            break;
        }
        if (pathSegments[i] !== 'login.html' && pathSegments[i] !== 'index.html') {
            levelsUp++;
        }
    }
    
    // Se não encontrou 'public', assumir que estamos 2 níveis abaixo
    if (levelsUp === 0 && (currentPath.includes('/modulos/') || currentPath.includes('/assets/'))) {
        levelsUp = 2;
    }
    
    return '../'.repeat(levelsUp) + 'index.html';
}

// Função para calcular o caminho relativo para qualquer página
function getRelativePath(targetPath) {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    // Remove o '/' inicial do targetPath se existir
    if (targetPath.startsWith('/')) {
        targetPath = targetPath.substring(1);
    }
    
    // Se estamos na raiz ou em /codigo/public/
    if (pathSegments.length <= 2 || currentPath.includes('/codigo/public/index.html')) {
        return './' + targetPath;
    }
    
    // Se estamos em um subdiretório
    let levelsUp = 0;
    for (let i = pathSegments.length - 1; i >= 0; i--) {
        if (pathSegments[i] === 'public') {
            break;
        }
        if (pathSegments[i] !== 'login.html' && pathSegments[i] !== 'index.html') {
            levelsUp++;
        }
    }
    
    // Se não encontrou 'public', assumir que estamos 2 níveis abaixo
    if (levelsUp === 0 && (currentPath.includes('/modulos/') || currentPath.includes('/assets/'))) {
        levelsUp = 2;
    }
    
    return '../'.repeat(levelsUp) + targetPath;
}


if (typeof window.API_URL === 'undefined') {
  window.API_URL = `${window.getApiUrl()}/usuarios`;
}

if (typeof window.ONGS_API_URL === 'undefined') {
  window.ONGS_API_URL = `${window.getApiUrl()}/ongs`;
}

const LOGIN_PAGE_FILENAME = "login.html";

var db_usuarios = { usuarios: [] };
var db_ongs = { ongs: [] }; 
var currentUser = {};

if (typeof displayMessage === 'undefined') {
  function displayMessage(message) {
    alert(message);
  }
}

function initLoginApp () {
    loadCurrentUser();
    
    document.addEventListener('DOMContentLoaded', function () {
        updateHeaderUI();
        
        // Forçar atualização do botão após um pequeno delay para garantir que a página carregou
        setTimeout(() => {
            updateHeaderUI();
        }, 100);
        
        const pathSegments = window.location.pathname.split('/');
        const currentPageFile = pathSegments.pop() || pathSegments.pop();

        if (currentPageFile === LOGIN_PAGE_FILENAME) {
            carregarUsuarios().catch(error => {
                console.error("Error loading users on login page:", error);
                displayMessage("Falha ao carregar dados de usuários. Tente recarregar a página.");
            });
            carregarOngs().catch(error => {
                console.warn("Could not load ONG data on login page init:", error);
            });

            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', handleLoginSubmit);
            } else {
                console.error("Login form with id 'loginForm' not found on login page.");
                displayMessage("Erro crítico: Formulário de login não encontrado. Contacte o suporte.");
            }
        } 
    });
}


async function carregarOngs() {
    try {
        const response = await fetch(window.ONGS_API_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            db_ongs = { ongs: data };
        } else if (data && Array.isArray(data.ongs)) {
             db_ongs = data;
        } else {
            console.error("ONG data from API is not in expected format:", data);
            db_ongs = { ongs: [] };
        }
    } catch (error) {
        console.error('Error loading ONGs via API:', error);
        db_ongs = { ongs: [] }; 
        throw error; 
    }
}

function loadCurrentUser() {
    let currentUserJSON = sessionStorage.getItem('currentUser');
    if (!currentUserJSON) {
        currentUserJSON = localStorage.getItem('currentUser');
    }

    if (currentUserJSON) {
        try {
            currentUser = JSON.parse(currentUserJSON);
        } catch (e) {
            console.error("Error parsing currentUser from storage:", e);
            currentUser = {};
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('currentUser');
        }
    } else {
        currentUser = {};
    }
}

function isUserLoggedIn() {
    return currentUser && currentUser.login;
}

function redirectToLogin() {
    if (LOGIN_URL.startsWith('/')) {
        window.location.href = window.location.origin + LOGIN_URL;
    } else {
        window.location.href = LOGIN_URL;
    }
}


async function handleLoginSubmit(event) {
    event.preventDefault();
    const loginForm = event.target;
    const login = (loginForm.username || loginForm.login).value;
    const senha = (loginForm.password || loginForm.senha).value;

    try {
        if (!db_usuarios || !db_usuarios.usuarios || db_usuarios.usuarios.length === 0) {
            await carregarUsuarios();
        }
        if (!db_ongs || !db_ongs.ongs || db_ongs.ongs.length === 0) {
            await carregarOngs().catch(error => {
                console.warn("Could not load ONG data during login attempt in handleLoginSubmit:", error);
            });
        }

        if (await authenticateUser(login, senha)) {
            // Verificar se há um redirecionamento pendente
            const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
            if (redirectAfterLogin) {
                sessionStorage.removeItem('redirectAfterLogin');
                window.location.href = getRelativePath(redirectAfterLogin);
            } else {
                window.location.href = getIndexPath();
            }
        } else {
            displayMessage("Login ou senha inválidos!");
        }
    } catch (error) {
        console.error("Error during handleLoginSubmit:", error);
        displayMessage("Ocorreu um erro ao tentar fazer login. Verifique o console para detalhes ou tente novamente.");
    }
}


async function authenticateUser(login, senha) {

    if (!db_ongs || !db_ongs.ongs || db_ongs.ongs.length === 0) { 
        console.warn("ONG database (db_ongs.ongs) is not available or empty. Attempting to load.");
        try {
            await carregarOngs();
            if (!db_ongs || !db_ongs.ongs || db_ongs.ongs.length === 0) {
                console.error("Failed to load ONG data or ONG data is empty after attempt during authentication.");
            }
        } catch (error) {
            console.error("Error loading ONGs during authentication attempt:", error);
        }
    }

    if (db_ongs && db_ongs.ongs && db_ongs.ongs.length > 0) {
        const ong = db_ongs.ongs.find(o => o.login === login);
        if (ong && ong.senha === senha) {
            currentUser = { ...ong, type: 'ong' };
            try {
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } catch (e) {
                console.error("Error saving ONG session to storage:", e);
            }
            updateHeaderUI();
            return true;
        }
    }

    if (!db_usuarios || !db_usuarios.usuarios || db_usuarios.usuarios.length === 0) { 
        console.warn("User database (db_usuarios.usuarios) is not available or empty. Attempting to load.");
        try {
            await carregarUsuarios();
            if (!db_usuarios || !db_usuarios.usuarios || db_usuarios.usuarios.length === 0) {
                console.error("Failed to load user data or user data is empty after attempt during authentication.");
            }
        } catch (error) {
            console.error("Error loading users during authentication attempt:", error);
        }
    }

    if (db_usuarios && db_usuarios.usuarios && db_usuarios.usuarios.length > 0) {
        const user = db_usuarios.usuarios.find(u => u.login === login);
        if (user && user.senha === senha) {
            currentUser = { ...user, type: 'user' };
            try {
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } catch (e) {
                console.error("Error saving user session to storage:", e);
            }
            updateHeaderUI();
            return true;
        }
    }

    return false;
}

function logoutUser () {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    currentUser = {};
    updateHeaderUI();
}

async function carregarUsuarios() {
    try {
        const response = await fetch(window.API_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
            db_usuarios = { usuarios: data };
        } else if (data && Array.isArray(data.usuarios)) {
             db_usuarios = data;
        } else {
            console.error("User data from API is not in expected format:", data);
            db_usuarios = { usuarios: [] };
            throw new Error("User data from API is not in expected format.");
        }
    } catch (error) {
        console.error('Error loading users via API:', error);
        db_usuarios = { usuarios: [] };
        throw error;
    }
}


function profileLinkHandler(e) {
    e.preventDefault();
    if (currentUser && currentUser.type) {
        let profileUrl = '';
        if (currentUser.type === 'ong') {
            profileUrl = ONG_PROFILE_URL;
        } else if (currentUser.type === 'user') {
            profileUrl = USER_PROFILE_URL;
        }

        if (profileUrl) {
            window.location.href = profileUrl;
        }
    }
}

function updateHeaderUI() {
    const userDropdownContainer = document.getElementById('userDropdownContainer');
    const userSection = document.getElementById('userSection');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userImageDisplay = document.getElementById('userImageDisplay');
    const logoutLink = document.getElementById('logoutLink');
    const dropdownProfileLink = document.getElementById('dropdownProfileLink');

    if (isUserLoggedIn()) {
        if (userDropdownContainer) userDropdownContainer.classList.remove('d-none');
        if (userSection) userSection.classList.add('d-none');
        
        let determinedProfileUrl = USER_PROFILE_URL;
        if (currentUser && currentUser.type === 'ong') {
            determinedProfileUrl = ONG_PROFILE_URL;
        }

        if (userNameDisplay) {
            if (currentUser.type === 'ong') {
                userNameDisplay.textContent = currentUser.nome_fantasia || 'ONG';
            } else {
                userNameDisplay.textContent = currentUser.nome || 'Usuário';
            }
            if (userNameDisplay.getAttribute('data-profile-listener-attached')) {
                userNameDisplay.removeEventListener('click', profileLinkHandler);
                userNameDisplay.removeAttribute('data-profile-listener-attached');
            }
            userNameDisplay.style.cursor = 'default'; 
        }
        
        if (dropdownProfileLink) {
            dropdownProfileLink.href = determinedProfileUrl;
            if (!dropdownProfileLink.getAttribute('data-profile-listener-attached')) {
                dropdownProfileLink.addEventListener('click', profileLinkHandler);
                dropdownProfileLink.setAttribute('data-profile-listener-attached', 'true');
            }
        }

        if (userImageDisplay) {
            if (currentUser.type === 'ong') {
                if (currentUser.imagem) {
                    userImageDisplay.src = currentUser.imagem;
                } else {
                    userImageDisplay.src = 'assets/images/default_ong_logo.png';
                }
            } else { // For type 'user'
                if (currentUser.fotoPerfil) {
                    userImageDisplay.src = currentUser.fotoPerfil;
                } else {
                    userImageDisplay.src = 'assets/images/usuario.png'; 
                }
            }
        }

        if (logoutLink && !logoutLink.getAttribute('data-listener-attached')) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
            });
            logoutLink.setAttribute('data-listener-attached', 'true');
        }
    } else {
        if (userDropdownContainer) userDropdownContainer.classList.add('d-none');
        if (userSection) userSection.classList.remove('d-none');
        
        // Alterar o texto do botão cadastrar baseado na página atual
        const registerButton = document.getElementById('registerButton');
        if (registerButton) {
            const currentPath = window.location.pathname;
            console.log('[DEBUG] Current path for button update:', currentPath);
            
            if (currentPath.includes('/ong/') || 
                currentPath.includes('ong.html') || 
                currentPath.includes('cadastro_ongs.html') ||
                currentPath.includes('perfil_ong.html') ||
                currentPath.includes('dashboard_ong.html') ||
                currentPath.includes('editar_perfil_ong.html')) {
                registerButton.textContent = 'Cadastrar Doador';
                registerButton.href = getRelativePath('modulos/user/cadastro_usuario.html');
                console.log('[DEBUG] Set button to "Cadastrar Doador"');
            } else if (currentPath.includes('/user/') || 
                       currentPath.includes('usuario.html') || 
                       currentPath.includes('cadastro_usuario.html') ||
                       currentPath.includes('perfil_usuario.html') ||
                       currentPath.includes('editar_perfil_usuario.html')) {
                registerButton.textContent = 'Cadastrar ONG';
                registerButton.href = getRelativePath('modulos/ong/cadastro_ongs.html');
                console.log('[DEBUG] Set button to "Cadastrar ONG"');
            } else {
                // Página padrão - mostrar opção para cadastrar usuário
                registerButton.textContent = 'Cadastrar';
                registerButton.href = getRelativePath('modulos/user/cadastro_usuario.html');
                console.log('[DEBUG] Set button to default "Cadastrar"');
            }
        }
        
        if (userNameDisplay) {
            userNameDisplay.textContent = 'Usuário';
            if (userNameDisplay.getAttribute('data-profile-listener-attached')) {
                userNameDisplay.removeEventListener('click', profileLinkHandler);
                userNameDisplay.removeAttribute('data-profile-listener-attached');
            }
            userNameDisplay.style.cursor = 'default';
        }
        if (dropdownProfileLink) {
            dropdownProfileLink.href = '#';
            if (dropdownProfileLink.getAttribute('data-profile-listener-attached')) {
                dropdownProfileLink.removeEventListener('click', profileLinkHandler);
                dropdownProfileLink.removeAttribute('data-profile-listener-attached');
            }
        }
        if (userImageDisplay) {
            userImageDisplay.src = 'assets/images/usuario.png';
        }
    }
}

async function addUser (nome, login, senha, email) {
    const newUser = { login, senha, nome, email };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const addedUser = await response.json();
        await carregarUsuarios(); 
        displayMessage(`Usuário ${nome} adicionado com sucesso!`);
        return addedUser;

    } catch (error) {
        console.error('Error adding user:', error);
        displayMessage("Erro ao salvar usuário: " + error.message);
        throw error; 
    }
}



initLoginApp();