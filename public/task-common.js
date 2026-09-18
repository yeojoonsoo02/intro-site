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
    startPresence(el);
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
      await api('/api/task/presence', { method: 'POST', body: JSON.stringify({ tab: TAB, away: true }) }).catch(() => {});
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

  // Presence: logged-in viewers send a heartbeat while the tab is visible; everyone polls the list.
  const BEAT_MS = 25000;
  const TAB = Math.random().toString(36).slice(2, 12);
  let presenceEl = null;
  let online = [];

  function renderPresence() {
    if (!presenceEl) return;
    const names = state.members.filter((m) => online.includes(m.id)).map((m) => m.name);
    presenceEl.innerHTML = names.length
      ? `<span class="dot"></span>접속 중 · ${names.map(esc).join(', ')}`
      : '<span class="dot off"></span>접속 중인 팀원 없음';
  }

  async function pollPresence() {
    try {
      online = (await api('/api/task/presence')).online;
      renderPresence();
    } catch {
      /* ignore */
    }
  }

  function beat() {
    if (!state.me || document.visibilityState !== 'visible') return;
    api('/api/task/presence', { method: 'POST', body: JSON.stringify({ tab: TAB }) }).then(pollPresence, () => {});
  }

  function away() {
    if (!state.me) return;
    navigator.sendBeacon('/api/task/presence', new Blob([JSON.stringify({ tab: TAB, away: true })], { type: 'application/json' }));
  }

  function startPresence(bar) {
    presenceEl = document.createElement('div');
    presenceEl.className = 'presence';
    bar.after(presenceEl);
    onAuth(() => { beat(); pollPresence(); });
    setInterval(() => { beat(); pollPresence(); }, BEAT_MS);
    document.addEventListener('visibilitychange', () => (document.visibilityState === 'visible' ? beat() : away()));
    window.addEventListener('pagehide', away);
  }

  window.Task = { esc, api, onAuth, mountBar, state };
})();
