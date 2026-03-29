const Auth = {
  getToken() { return localStorage.getItem('token'); },

  getUser() {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
  },

  isLoggedIn() { return !!this.getUser(); },

  logout() {
    localStorage.removeItem('token');
    renderNavUser();
    Router.navigate('/');
  },
};

function renderNavUser() {
  const el = document.getElementById('navUser');
  const user = Auth.getUser();
  if (user) {
    el.innerHTML = `
      ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}" />` : ''}
      <span style="color:#fff;font-size:.9rem">${user.name.split(' ')[0]}</span>
      <button class="btn-logout" onclick="Auth.logout()">Sair</button>
    `;
  } else {
    el.innerHTML = `<a href="/auth/google" class="btn-login">Entrar com Google</a>`;
  }
}

// Captura token da URL após redirect OAuth
(function captureToken() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    localStorage.setItem('token', token);
    window.history.replaceState({}, '', '/');
  }
})();
