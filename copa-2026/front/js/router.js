const Router = {
  routes: {},

  add(path, handler) {
    this.routes[path] = handler;
  },

  async navigate(path, push = true) {
    if (push) history.pushState({}, '', path);
    const app = document.getElementById('app');

    // Atualiza link ativo
    document.querySelectorAll('.navbar__links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === path || (path === '/' && a.getAttribute('href') === '/'));
    });

    // Match exato ou com parâmetros
    let handler = this.routes[path];
    let params = {};

    if (!handler) {
      for (const [route, fn] of Object.entries(this.routes)) {
        if (route.includes(':')) {
          const routeParts = route.split('/');
          const pathParts = path.split('/');
          if (routeParts.length === pathParts.length) {
            const match = routeParts.every((part, i) =>
              part.startsWith(':') || part === pathParts[i]
            );
            if (match) {
              routeParts.forEach((part, i) => {
                if (part.startsWith(':')) params[part.slice(1)] = pathParts[i];
              });
              handler = fn;
              break;
            }
          }
        }
      }
    }

    if (handler) {
      app.innerHTML = '<p style="text-align:center;padding:3rem;color:#888">Carregando...</p>';
      try { app.innerHTML = await handler(params); }
      catch (e) {
        const safePath = path.replace(/['"<>]/g, '');
        app.innerHTML = `
          <div style="text-align:center;padding:3rem">
            <p style="color:#c62828;margin-bottom:1rem">${e.message || 'Erro ao carregar a página.'}</p>
            <button onclick="Router.navigate('${safePath}', false)"
              style="background:var(--blue);color:#fff;padding:.5rem 1.5rem;border-radius:20px;font-weight:600">
              Tentar novamente
            </button>
          </div>
        `;
      }
      bindEvents();
    } else {
      app.innerHTML = '<h2 style="padding:2rem">Página não encontrada</h2>';
    }
  },

  init() {
    window.addEventListener('popstate', () => this.navigate(location.pathname, false));
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
    // Hamburger
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('open');
    });
  },
};
