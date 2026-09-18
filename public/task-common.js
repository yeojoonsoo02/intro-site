// Shared helpers for TemuTemu pages: API calls, escaping, login bar.
(function () {
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  const state = { me: null, members: [], listeners: [] };

  function onAuth(fn) {
    state.listeners.push(fn);
  }

  function emit() {
    state.listeners.forEach((fn) => fn(state.me));
  }

  function renderBar(el) {
    if (state.me) {
      el.innerHTML = `<span>Logged in as <b>${esc(state.me.name)}</b></span>
        <button type="button" class="linkbtn" data-act="logout">Log out</button>`;
      return;
    }
    el.innerHTML = `<form class="login" autocomplete="on">
        <select name="member" required aria-label="Name">
          <option value="">Select name</option>
          ${state.members.map((m) => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('')}
        </select>
        <input name="password" type="password" placeholder="Password" required autocomplete="current-password" aria-label="Password">
        <button type="submit">Log in</button>
        <span class="err" role="alert"></span>
      </form>`;
  }

  async function mountBar(el) {
    el.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      const err = f.querySelector('.err');
      err.textContent = '';
      try {
        const r = await api('/api/task/session', {
          method: 'POST',
          body: JSON.stringify({ member: f.member.value, password: f.password.value }),
        });
        state.me = r.me;
        renderBar(el);
        emit();
      } catch (ex) {
        err.textContent = ex.message;
      }
    });
    el.addEventListener('click', async (e) => {
      if (e.target.dataset.act !== 'logout') return;
      await api('/api/task/session', { method: 'DELETE' }).catch(() => {});
      state.me = null;
      renderBar(el);
      emit();
    });
    try {
      const r = await api('/api/task/session');
      state.members = r.members;
      state.me = r.me;
    } catch {
      /* page still works read-only */
    }
    renderBar(el);
    emit();
  }

  window.Task = { esc, api, onAuth, mountBar, state };
})();
