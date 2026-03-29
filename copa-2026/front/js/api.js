const API = {
  async request(method, path, body) {
    const token = localStorage.getItem('token');
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(path, opts);
    } catch {
      throw new Error('Falha de conexão. Verifique sua internet e tente novamente.');
    }
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    return res.json();
  },

  get: (path) => API.request('GET', path),
  post: (path, body) => API.request('POST', path, body),
  put: (path, body) => API.request('PUT', path, body),
};
