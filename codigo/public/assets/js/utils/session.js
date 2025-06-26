function getSession() {
    const session = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
}

function setSession(user, rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('currentUser', JSON.stringify(user));
}

function clearSession() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
}

function checkAccess(allowedRoles) {
    const currentUser = getSession();
    if (!currentUser || !allowedRoles.includes(currentUser.tipo)) {
        window.location.href = '/modulos/login/login.html'; 
        return false;
    }
    return currentUser;
}
