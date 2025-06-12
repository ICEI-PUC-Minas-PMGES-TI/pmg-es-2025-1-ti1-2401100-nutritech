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

const LOGIN_URL = "/public/modulos/login/login.html";
const RETURN_URL = "/public/index.html";
const API_URL = 'http://localhost:3001/usuarios';
const LOGIN_PAGE_FILENAME = "login.html";

var db_usuarios = { usuarios: [] };
var usuarioCorrente = {};


function initLoginApp () {
    loadCurrentUserFromSession();
    
    document.addEventListener('DOMContentLoaded', function () {
        updateHeaderUI();
        
        const currentPagePath = window.location.pathname;

        if (currentPagePath === LOGIN_URL) {
            carregarUsuarios().catch(error => {
                console.error("Error loading users on login page:", error);
                displayMessage("Falha ao carregar dados necessários para login. Tente recarregar a página.");
            });

            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', handleLoginSubmit);
            }
        } 
    });
}

function loadCurrentUserFromSession() {
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        try {
            usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
        } catch (e) {
            console.error("Error parsing usuarioCorrente from sessionStorage:", e);
            usuarioCorrente = {};
            sessionStorage.removeItem('usuarioCorrente');
        }
    } else {
        usuarioCorrente = {};
    }
}

function isUserLoggedIn() {
    return usuarioCorrente && usuarioCorrente.login;
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
    const login = loginForm.login.value;
    const senha = loginForm.senha.value;

    try {
        if (!db_usuarios || !db_usuarios.usuarios || db_usuarios.usuarios.length === 0) {
            await carregarUsuarios();
        }

        if (await authenticateUser(login, senha)) {
            const absoluteRedirectUrl = window.location.origin + RETURN_URL;
            window.location.href = absoluteRedirectUrl;
        } else {
            displayMessage("Login ou senha inválidos!");
        }
    } catch (error) {
        console.error("Error during handleLoginSubmit:", error);
        displayMessage("Ocorreu um erro ao tentar fazer login. Verifique o console para detalhes.");
    }
}


async function authenticateUser(login, senha) {
    if (!db_usuarios || !db_usuarios.usuarios) {
        console.error("User database (db_usuarios.usuarios) is not available for authentication.");
        try {
            await carregarUsuarios();
            if (!db_usuarios || !db_usuarios.usuarios) {
                console.error("Failed to load user data after retry during authentication.");
                return false;
            }
        } catch (error) {
            console.error("Error loading users during authentication attempt:", error);
            return false;
        }
    }

    const user = db_usuarios.usuarios.find(u => u.login === login);

    if (user && user.senha === senha) {
        usuarioCorrente = user;
        try {
            sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
        } catch (e) {
            console.error("Error saving user session to sessionStorage:", e);
        }
        updateHeaderUI();
        return true;
    }
    return false;
}

function logoutUser () {
    sessionStorage.removeItem('usuarioCorrente');
    usuarioCorrente = {};
    updateHeaderUI();
}

async function carregarUsuarios() {
    try {
        const response = await fetch(API_URL);
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


function updateHeaderUI() {
    const userDropdownContainer = document.getElementById('userDropdownContainer');
    const userSection = document.getElementById('userSection'); // Changed from authButtonsContainer
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutLink = document.getElementById('logoutLink');

    if (isUserLoggedIn()) {
        if (userDropdownContainer) userDropdownContainer.classList.remove('d-none');
        if (userSection) userSection.classList.add('d-none'); // Changed from authButtonsContainer
        if (userNameDisplay) userNameDisplay.textContent = usuarioCorrente.nome || usuarioCorrente.login;
        if (logoutLink) {
            logoutLink.removeEventListener('click', logoutUser); 
            logoutLink.addEventListener('click', logoutUser);
        }
    } else {
        if (userDropdownContainer) userDropdownContainer.classList.add('d-none');
        if (userSection) userSection.classList.remove('d-none'); // Changed from authButtonsContainer
        if (logoutLink) {
            logoutLink.removeEventListener('click', logoutUser);
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



function displayMessage(message) {
    alert(message);
}


initLoginApp();