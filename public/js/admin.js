/* GEST26 — Panel de administración */
(() => {
  'use strict';
  const TKEY = 'gest26_admin_token';
  let token = localStorage.getItem(TKEY) || '';
  let defaults = {};

  const $ = (s) => document.querySelector(s);
  const login = $('#login');
  const shell = $('#shell');

  /* Estructura del editor: grupos y etiquetas amigables */
  const GROUPS = [
    { title: 'Cabecera (Hero)', desc: 'Lo primero que ve el visitante en la página de inicio.', fields: [
      ['hero_badge', 'Etiqueta superior', 1],
      ['hero_title', 'Titular principal (negrita)', 2],
      ['hero_em', 'Segunda línea (itálica gris)', 2],
      ['hero_subtitle', 'Subtítulo', 3],
      ['hero_cta', 'Botón principal', 1],
      ['hero_cta2', 'Botón secundario', 1],
      ['hero_support', 'Frase de apoyo', 2],
    ]},
    { title: 'Problema', desc: 'Bloque donde el cliente se reconoce.', fields: [
      ['problema_title', 'Título', 2],
      ['problema_text', 'Texto', 3],
    ]},
    { title: 'Propuesta de valor', desc: 'Por qué existe GEST26.', fields: [
      ['valor_title', 'Título', 2],
      ['valor_text', 'Texto', 3],
    ]},
    { title: 'Títulos de sección', desc: 'Encabezados de cada bloque de la home.', fields: [
      ['metodo_title', 'Título · Método', 1],
      ['servicios_title', 'Título · Servicios', 1],
      ['sectores_title', 'Título · Sectores', 1],
      ['compara_title', 'Título · Comparativa', 2],
      ['faq_title', 'Título · FAQ', 1],
    ]},
    { title: 'Reporting', desc: 'Bloque de qué recibe el cliente.', fields: [
      ['reporting_title', 'Título', 2],
      ['reporting_text', 'Texto', 2],
    ]},
    { title: 'Llamada a la acción final', desc: 'Cierre de la home.', fields: [
      ['cta_title', 'Título', 2],
      ['cta_text', 'Texto', 3],
      ['cta_button', 'Texto del botón', 1],
    ]},
    { title: 'Página de contacto', desc: 'Cabecera de /contacto.', fields: [
      ['contacto_title', 'Título', 1],
      ['contacto_text', 'Texto', 3],
    ]},
    { title: 'Datos de contacto y pie', desc: 'Aparecen en el footer y la página de contacto.', fields: [
      ['footer_text', 'Texto del pie', 2],
      ['contact_email', 'Email de contacto', 1],
      ['contact_phone', 'Teléfono (opcional)', 1],
      ['linkedin_url', 'URL de LinkedIn', 1],
    ]},
  ];

  function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }; }

  /* ---- Login ---- */
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('#login-msg');
    msg.className = 'form-msg';
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: $('#usuario').value, password: $('#password').value }),
      });
      const out = await res.json();
      if (res.ok && out.token) {
        token = out.token; localStorage.setItem(TKEY, token);
        enter();
      } else {
        msg.textContent = out.message || 'No se pudo iniciar sesión.'; msg.className = 'form-msg bad';
      }
    } catch {
      msg.textContent = 'Error de conexión.'; msg.className = 'form-msg bad';
    }
  });

  $('#logout').addEventListener('click', () => { localStorage.removeItem(TKEY); location.reload(); });

  /* ---- Tabs ---- */
  document.querySelectorAll('.admin-tab').forEach((t) => t.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    $('#panel-' + t.dataset.tab).classList.add('active');
    if (t.dataset.tab === 'leads') loadLeads();
    if (t.dataset.tab === 'posts') loadPosts();
    if (t.dataset.tab === 'sections') loadSections();
  }));

  /* ---- Editor de contenido ---- */
  function renderFields(content) {
    const wrap = $('#content-fields');
    wrap.innerHTML = '';
    GROUPS.forEach((g) => {
      const box = document.createElement('div');
      box.className = 'admin-group';
      box.innerHTML = `<h3>${g.title}</h3><p>${g.desc}</p>`;
      g.fields.forEach(([key, label, lines]) => {
        const val = (content[key] ?? '').replace(/"/g, '&quot;');
        const f = document.createElement('div');
        f.className = 'admin-field';
        if (lines > 1) {
          f.innerHTML = `<label>${label}</label><textarea data-key="${key}" rows="${lines + 1}">${content[key] ?? ''}</textarea>`;
        } else {
          f.innerHTML = `<label>${label}</label><input data-key="${key}" type="text" value="${val}" />`;
        }
        box.appendChild(f);
      });
      wrap.appendChild(box);
    });
  }

  async function loadContent() {
    const res = await fetch('/api/admin/content', { headers: authHeaders() });
    if (res.status === 401) return logout401();
    const out = await res.json();
    defaults = out.defaults || {};
    renderFields(out.content);
  }

  function collect() {
    const data = {};
    document.querySelectorAll('#content-fields [data-key]').forEach((el) => { data[el.dataset.key] = el.value; });
    return data;
  }

  $('#save-content').addEventListener('click', async () => {
    const res = await fetch('/api/admin/content', { method: 'POST', headers: authHeaders(), body: JSON.stringify(collect()) });
    if (res.status === 401) return logout401();
    const sm = $('#saved-msg'); sm.classList.add('show'); setTimeout(() => sm.classList.remove('show'), 2200);
  });

  $('#reset-content').addEventListener('click', () => {
    if (!confirm('¿Restaurar todos los textos a los valores por defecto? Tendrás que guardar para aplicarlo.')) return;
    renderFields(defaults);
  });

  /* ---- Posts (Actualidad) ---- */
  let postsState = [];
  function renderPosts() {
    const wrap = $('#posts-editor');
    if (!postsState.length) { wrap.innerHTML = '<div class="empty">No hay publicaciones. Pulsa “Añadir publicación”.</div>'; return; }
    wrap.innerHTML = postsState.map((p, i) => `
      <div class="admin-group" data-i="${i}">
        <div style="display:flex;justify-content:space-between;align-items:center"><h3>Publicación ${i + 1}</h3>
          <button class="lead-card__actions" data-del-post="${i}" style="padding:7px 14px;border-radius:999px;border:1px solid var(--line);background:#fff;font-size:.82rem;font-weight:600;color:#a8442f;cursor:pointer">Eliminar</button></div>
        <div class="admin-field"><label>Título</label><input data-f="title" type="text" value="${escAttr(p.title)}" /></div>
        <div class="admin-field"><label>Fecha o etiqueta (opcional)</label><input data-f="date" type="text" value="${escAttr(p.date)}" placeholder="Ej. Mayo 2026 (o vacío)" /></div>
        <div class="admin-field"><label>Resumen</label><textarea data-f="excerpt" rows="3">${escHtml(p.excerpt)}</textarea></div>
        <div class="admin-field"><label>Enlace al post de LinkedIn (URL)</label><input data-f="url" type="text" value="${escAttr(p.url)}" placeholder="https://www.linkedin.com/..." /></div>
        <div class="admin-field"><label>Imagen (URL, opcional)</label><input data-f="image" type="text" value="${escAttr(p.image)}" placeholder="https://..." /></div>
      </div>`).join('');
    wrap.querySelectorAll('[data-del-post]').forEach((b) => b.addEventListener('click', () => { postsState.splice(+b.dataset.delPost, 1); renderPosts(); }));
  }
  function escAttr(s) { return String(s || '').replace(/"/g, '&quot;'); }
  function escHtml(s) { return String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }
  function collectPosts() {
    return [...document.querySelectorAll('#posts-editor .admin-group')].map((g, i) => {
      const get = (f) => g.querySelector(`[data-f="${f}"]`)?.value || '';
      return { id: postsState[i]?.id || 'p' + (i + 1), title: get('title'), date: get('date'), excerpt: get('excerpt'), url: get('url'), image: get('image') };
    });
  }
  async function loadPosts() {
    const res = await fetch('/api/admin/posts', { headers: authHeaders() });
    if (res.status === 401) return logout401();
    const out = await res.json();
    postsState = out.posts || [];
    renderPosts();
  }
  $('#add-post').addEventListener('click', () => {
    postsState = collectPosts();
    postsState.push({ id: 'p' + (postsState.length + 1), title: '', date: '', excerpt: '', url: 'https://www.linkedin.com/company/gest26/', image: '' });
    renderPosts();
  });
  $('#save-posts').addEventListener('click', async () => {
    const res = await fetch('/api/admin/posts', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ posts: collectPosts() }) });
    if (res.status === 401) return logout401();
    const out = await res.json();
    postsState = out.posts || [];
    const sm = $('#saved-posts'); sm.classList.add('show'); setTimeout(() => sm.classList.remove('show'), 2200);
  });

  /* ---- Secciones personalizadas ---- */
  let sectionsState = [];
  const SEC_LABEL = { banner: 'Banner con imagen', split: 'Imagen + texto', texto: 'Texto', cta: 'Llamada a la acción' };
  function renderSections() {
    const wrap = $('#sections-editor');
    if (!sectionsState.length) { wrap.innerHTML = '<div class="empty">No hay secciones añadidas. Usa los botones de arriba.</div>'; return; }
    wrap.innerHTML = sectionsState.map((s, i) => {
      const showImg = s.type === 'banner' || s.type === 'split';
      const showCta = true;
      const showTheme = s.type === 'texto';
      return `<div class="admin-group" data-i="${i}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <h3>${SEC_LABEL[s.type] || 'Sección'} ${i + 1}</h3>
          <div style="display:flex;gap:6px">
            <button class="sec-btn" data-up="${i}" title="Subir">↑</button>
            <button class="sec-btn" data-down="${i}" title="Bajar">↓</button>
            <button class="sec-btn" data-del-sec="${i}" style="color:#a8442f">Eliminar</button>
          </div>
        </div>
        <div class="admin-field"><label>Etiqueta superior (opcional)</label><input data-f="eyebrow" type="text" value="${escAttr(s.eyebrow)}" /></div>
        <div class="admin-field"><label>Título</label><input data-f="title" type="text" value="${escAttr(s.title)}" /></div>
        <div class="admin-field"><label>Texto</label><textarea data-f="text" rows="3">${escHtml(s.text)}</textarea></div>
        ${showImg ? `<div class="admin-field"><label>Imagen</label>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <input data-f="image" type="text" value="${escAttr(s.image)}" placeholder="/uploads/... o URL" style="flex:1;min-width:200px" />
            <label class="btn btn--ghost" style="padding:9px 14px;font-size:.82rem;cursor:pointer;margin:0">Subir imagen<input type="file" accept="image/*" data-upload="${i}" hidden /></label>
          </div>
          <div data-thumb="${i}" style="margin-top:8px">${s.image ? `<img src="${escAttr(s.image)}" style="height:60px;border-radius:8px;border:1px solid var(--line)"/>` : ''}</div>
        </div>` : ''}
        ${showCta ? `<div class="row-2" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="admin-field"><label>Texto del botón (opcional)</label><input data-f="cta_text" type="text" value="${escAttr(s.cta_text)}" /></div>
          <div class="admin-field"><label>Enlace del botón</label><input data-f="cta_url" type="text" value="${escAttr(s.cta_url)}" placeholder="/contacto" /></div>
        </div>` : ''}
        ${showTheme ? `<div class="admin-field"><label>Fondo</label><select data-f="theme"><option value="light"${s.theme !== 'dark' ? ' selected' : ''}>Claro</option><option value="dark"${s.theme === 'dark' ? ' selected' : ''}>Oscuro (navy)</option></select></div>` : ''}
      </div>`;
    }).join('');
    wrap.querySelectorAll('[data-del-sec]').forEach((b) => b.addEventListener('click', () => { sectionsState = collectSections(); sectionsState.splice(+b.dataset.delSec, 1); renderSections(); }));
    wrap.querySelectorAll('[data-up]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.up; if (i > 0) { sectionsState = collectSections(); [sectionsState[i - 1], sectionsState[i]] = [sectionsState[i], sectionsState[i - 1]]; renderSections(); } }));
    wrap.querySelectorAll('[data-down]').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.down; if (i < sectionsState.length - 1) { sectionsState = collectSections(); [sectionsState[i + 1], sectionsState[i]] = [sectionsState[i], sectionsState[i + 1]]; renderSections(); } }));
    wrap.querySelectorAll('[data-upload]').forEach((inp) => inp.addEventListener('change', (ev) => uploadImage(ev, +inp.dataset.upload)));
  }
  function collectSections() {
    return [...document.querySelectorAll('#sections-editor .admin-group')].map((g, i) => {
      const get = (f) => { const el = g.querySelector(`[data-f="${f}"]`); return el ? el.value : (sectionsState[i] ? sectionsState[i][f] : ''); };
      return { id: sectionsState[i]?.id || 's' + (i + 1), type: sectionsState[i]?.type || 'texto', eyebrow: get('eyebrow'), title: get('title'), text: get('text'), image: get('image'), cta_text: get('cta_text'), cta_url: get('cta_url'), theme: get('theme') || 'light' };
    });
  }
  async function uploadImage(ev, idx) {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      sectionsState = collectSections();
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ dataUrl: reader.result }) });
        const out = await res.json();
        if (out.ok && out.url) { sectionsState[idx].image = out.url; renderSections(); }
        else alert(out.message || 'No se pudo subir la imagen.');
      } catch { alert('Error subiendo la imagen.'); }
    };
    reader.readAsDataURL(file);
  }
  async function loadSections() {
    const res = await fetch('/api/admin/sections', { headers: authHeaders() });
    if (res.status === 401) return logout401();
    const out = await res.json();
    sectionsState = out.sections || [];
    renderSections();
  }
  document.querySelectorAll('.add-section').forEach((b) => b.addEventListener('click', () => {
    sectionsState = collectSections();
    sectionsState.push({ id: 's' + (sectionsState.length + 1), type: b.dataset.type, eyebrow: '', title: '', text: '', image: '', cta_text: '', cta_url: '/contacto', theme: 'light' });
    renderSections();
  }));
  $('#save-sections').addEventListener('click', async () => {
    const res = await fetch('/api/admin/sections', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ sections: collectSections() }) });
    if (res.status === 401) return logout401();
    const out = await res.json();
    sectionsState = out.sections || [];
    const sm = $('#saved-sections'); sm.classList.add('show'); setTimeout(() => sm.classList.remove('show'), 2200);
  });

  /* ---- Leads ---- */
  async function loadLeads() {
    const list = $('#leads-list');
    const res = await fetch('/api/admin/leads', { headers: authHeaders() });
    if (res.status === 401) return logout401();
    const out = await res.json();
    const leads = out.leads || [];
    $('#lead-count').textContent = leads.length ? `(${leads.length})` : '';
    if (!leads.length) { list.innerHTML = '<div class="empty">Todavía no hay mensajes. Cuando alguien rellene el formulario de contacto, aparecerá aquí.</div>'; return; }
    list.innerHTML = leads.map(leadCard).join('');
    list.querySelectorAll('[data-mark]').forEach((b) => b.addEventListener('click', () => markRead(b.dataset.mark, b.dataset.val === 'true')));
    list.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => delLead(b.dataset.del)));
  }

  function esc(s) { return String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }
  function fmtDate(iso) { try { return new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return iso; } }

  function leadCard(l) {
    const meta = [];
    if (l.empresa) meta.push(`🏢 ${esc(l.empresa)}`);
    meta.push(`<a href="mailto:${esc(l.email)}">${esc(l.email)}</a>`);
    if (l.telefono) meta.push(`📞 ${esc(l.telefono)}`);
    if (l.ciudad) meta.push(`📍 ${esc(l.ciudad)}`);
    if (l.servicio) meta.push(`🎯 ${esc(l.servicio)}`);
    return `<div class="lead-card ${l.leido ? '' : 'unread'}">
      <div class="lead-card__top">
        <div><h4>${esc(l.nombre)} ${l.leido ? '' : '<span class="lead-tag">Nuevo</span>'}</h4>
        <div class="meta">${meta.join('<span>·</span>')}</div></div>
        <div class="lead-card__actions">
          <button data-mark="${l.id}" data-val="${!l.leido}">${l.leido ? 'Marcar no leído' : 'Marcar leído'}</button>
          <button data-del="${l.id}">Eliminar</button>
        </div>
      </div>
      <div class="msg">${esc(l.mensaje)}</div>
      <div style="font-size:.78rem;color:#6c7782;margin-top:10px">${fmtDate(l.receivedAt)}</div>
    </div>`;
  }

  async function markRead(id, val) {
    await fetch('/api/admin/leads/' + id, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ leido: val }) });
    loadLeads();
  }
  async function delLead(id) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    await fetch('/api/admin/leads/' + id, { method: 'DELETE', headers: authHeaders() });
    loadLeads();
  }
  $('#refresh-leads').addEventListener('click', loadLeads);

  function logout401() { localStorage.removeItem(TKEY); token = ''; login.style.display = ''; shell.classList.remove('active'); }

  /* ---- Arranque ---- */
  function enter() {
    login.style.display = 'none';
    shell.classList.add('active');
    loadContent();
  }
  if (token) {
    fetch('/api/admin/content', { headers: authHeaders() }).then((r) => {
      if (r.ok) enter(); else logout401();
    }).catch(logout401);
  }
})();
