/* GEST26 — interacciones del front público */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = matchMedia('(hover: none), (pointer: coarse)').matches;
  // Modo "scroll activa el efecto": en táctil o en pantallas pequeñas (donde no hay hover útil)
  const scrollMode = coarsePointer || matchMedia('(max-width: 720px)').matches;

  /* ---- Inyección de contenido editable desde /api/content ---- */
  async function loadContent() {
    const nodes = document.querySelectorAll('[data-cms]');
    if (!nodes.length) return;
    try {
      const res = await fetch('/api/content');
      const c = await res.json();
      nodes.forEach((el) => {
        const key = el.getAttribute('data-cms');
        if (c[key] == null || c[key] === '') return;
        const attr = el.getAttribute('data-cms-attr');
        if (attr) el.setAttribute(attr, c[key]);
        else el.textContent = c[key];
      });
      // Enlaces dinámicos
      document.querySelectorAll('[data-cms-href]').forEach((el) => {
        const key = el.getAttribute('data-cms-href');
        if (!c[key]) return;
        const val = key === 'contact_email' ? 'mailto:' + c[key] : c[key];
        el.setAttribute('href', val);
      });
    } catch { /* deja el contenido por defecto del HTML */ }
  }
  loadContent();

  /* ---- Render de publicaciones (página Actualidad) ---- */
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const postsGrid = document.getElementById('posts-grid');
  if (postsGrid) {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((posts) => {
        if (!Array.isArray(posts) || !posts.length) {
          postsGrid.innerHTML = '<p class="empty">Pronto publicaremos novedades. Síguenos en LinkedIn.</p>';
          return;
        }
        postsGrid.innerHTML = posts
          .map((p) => {
            const url = esc(p.url || '#');
            const img = p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" />` : '';
            const date = p.date ? esc(p.date) : 'GEST26 · LinkedIn';
            return `<article class="post in">
              <div class="post__media">${img}<a class="post__play" href="${url}" target="_blank" rel="noopener" aria-label="Abrir en LinkedIn"><span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></a></div>
              <div class="post__body"><span class="post__date">${date}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p>
                <a class="post__link" href="${url}" target="_blank" rel="noopener">Leer en LinkedIn <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg></a></div>
            </article>`;
          })
          .join('');
      })
      .catch(() => { postsGrid.innerHTML = '<p class="empty">No se pudieron cargar las publicaciones.</p>'; });
  }

  /* ---- Secciones personalizadas (creadas desde el admin) ---- */
  const customWrap = document.getElementById('custom-sections');
  if (customWrap) {
    const e = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
    const cta = (s) => (s.cta_text && s.cta_url) ? `<a href="${e(s.cta_url)}" class="btn btn--primary" style="margin-top:18px">${e(s.cta_text)}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>` : '';
    const eyebrow = (s) => s.eyebrow ? `<span class="eyebrow">${e(s.eyebrow)}</span>` : '';
    const render = (s) => {
      if (s.type === 'banner') return `<section class="section section--tight"><div class="container"><div class="editorial editorial--short">${s.image ? `<img class="editorial__img" src="${e(s.image)}" alt="" loading="lazy"/>` : ''}<div class="editorial__body">${eyebrow(s)}<h2 class="title">${e(s.title)}</h2><p>${e(s.text)}</p>${cta(s)}</div></div></div></section>`;
      if (s.type === 'split') return `<section class="section"><div class="container split"><div>${eyebrow(s)}<h2 class="title" style="margin:12px 0 14px">${e(s.title)}</h2><p class="lead">${e(s.text)}</p>${cta(s)}</div><div class="split__media">${s.image ? `<div class="media-frame"><img src="${e(s.image)}" alt="" loading="lazy"/></div>` : ''}</div></div></section>`;
      if (s.type === 'cta') return `<section class="section ctaband section--ink"><div class="ctaband__glow"></div><div class="container ctaband__inner">${eyebrow(s)}<h2 class="display"><span class="display__bold">${e(s.title)}</span></h2><p class="lead">${e(s.text)}</p><div class="ctaband__actions">${(s.cta_text && s.cta_url) ? `<a href="${e(s.cta_url)}" class="btn btn--green">${e(s.cta_text)}</a>` : ''}</div></div></section>`;
      // texto
      const dark = s.theme === 'dark';
      return `<section class="section ${dark ? 'section--ink' : 'section--soft'}"><div class="container"><div class="section-head center" style="margin:0 auto">${eyebrow(s)}<h2 class="title" ${dark ? 'style="color:#fff"' : ''}>${e(s.title)}</h2><p class="lead">${e(s.text)}</p>${cta(s)}</div></div></section>`;
    };
    fetch('/api/sections').then((r) => r.json()).then((list) => {
      if (Array.isArray(list) && list.length) customWrap.innerHTML = list.map(render).join('');
    }).catch(() => {});
  }

  /* ---- Navbar scroll + menú móvil ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const burger = nav.querySelector('.nav__burger');
    burger && burger.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('.nav__links a').forEach((a) =>
      a.addEventListener('click', () => nav.classList.remove('open'))
    );
  }

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll('[data-reveal]');
  const revealAll = () => reveals.forEach((el) => el.classList.add('in'));
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
    // Failsafe: lo que esté en la primera pantalla nunca debe quedar invisible,
    // aunque el observer no dispare (entornos sin frames/scroll). Forzado instantáneo.
    const ensureVisible = () => {
      reveals.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.05 && r.bottom > 0 && !el.classList.contains('in')) {
          el.style.transition = 'none';
          el.classList.add('in');
        }
      });
    };
    setTimeout(ensureVisible, 1000);
    window.addEventListener('load', () => setTimeout(ensureVisible, 300), { once: true });
  } else {
    revealAll();
  }

  /* ---- Parallax sutil ---- */
  const px = document.querySelectorAll('[data-parallax]');
  if (px.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        px.forEach((el) => {
          const sp = parseFloat(el.getAttribute('data-parallax')) || 0.08;
          el.style.transform = `translateY(${y * sp * -1}px)`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Parallax 3D de la órbita (decorativo, con inercia tipo muelle) ---- */
  const orbit = document.querySelector('.orbit');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (orbit && fine && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const hero = orbit.closest('.hero') || document.body;
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tx = px * 16; ty = -py * 12; // grados objetivo
      if (!raf) loop();
    };
    const loop = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08; // interpolación = inercia
      orbit.style.setProperty('--tx', cx.toFixed(2) + 'deg');
      orbit.style.setProperty('--ty', cy.toFixed(2) + 'deg');
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(loop);
      else raf = null;
    };
    hero.addEventListener('mousemove', onMove, { passive: true });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; if (!raf) loop(); });
  }

  /* ---- Statement scroll-pinned: la sección se fija y cambian 3 conceptos ---- */
  const rotorPin = document.querySelector('[data-rotor-pin]');
  if (rotorPin) {
    const words = [...rotorPin.children];
    const dots = [...document.querySelectorAll('.statement__dots i')];
    const pin = document.querySelector('.statement-pin');
    let cur = -1;
    const show = (n) => {
      if (n === cur) return;
      cur = n;
      words.forEach((w, i) => { w.classList.toggle('on', i === n); w.classList.toggle('off-up', i < n); });
      dots.forEach((d, i) => d.classList.toggle('on', i === n));
    };
    show(0);
    if (!reduceMotion && pin) {
      let ticking = false;
      const compute = () => {
        const total = pin.offsetHeight - window.innerHeight;
        const passed = Math.min(Math.max(-pin.getBoundingClientRect().top, 0), total);
        const prog = total > 0 ? passed / total : 0;
        show(Math.min(words.length - 1, Math.floor(prog * words.length * 0.999)));
        ticking = false;
      };
      window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(compute); } }, { passive: true });
      compute();
    }
  }

  /* ---- data-inview: activa .is-active al entrar en pantalla (efecto sin hover en móvil) ---- */
  const inviews = document.querySelectorAll('[data-inview]');
  if (inviews.length && 'IntersectionObserver' in window) {
    const io3 = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting && e.intersectionRatio > 0.35));
    }, { threshold: [0, 0.35, 0.6] });
    inviews.forEach((el) => io3.observe(el));
  }

  /* ---- data-focus-group: en móvil, la tarjeta más centrada toma el foco (sustituye al hover) ---- */
  if (scrollMode) {
    const groups = document.querySelectorAll('[data-focus-group]');
    if (groups.length) {
      let ticking = false;
      const update = () => {
        const mid = window.innerHeight / 2;
        groups.forEach((g) => {
          const items = [...g.children];
          let best = null, bestD = Infinity;
          items.forEach((it) => {
            const r = it.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) return;
            const d = Math.abs((r.top + r.bottom) / 2 - mid);
            if (d < bestD) { bestD = d; best = it; }
          });
          g.classList.toggle('has-active', !!best);
          items.forEach((it) => it.classList.toggle('is-active', it === best));
        });
        ticking = false;
      };
      window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }
  }

  /* ---- FAQ acordeón ---- */
  document.querySelectorAll('.faq__item').forEach((item) => {
    const q = item.querySelector('.faq__q');
    const a = item.querySelector('.faq__a');
    q.addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach((o) => {
        if (o !== item) { o.classList.remove('open'); o.querySelector('.faq__a').style.maxHeight = null; }
      });
      item.classList.toggle('open', !open);
      a.style.maxHeight = open ? null : a.scrollHeight + 'px';
    });
  });

  /* ---- Animación de barras del reporting al entrar ---- */
  const bars = document.querySelector('.report__bars');
  if (bars && 'IntersectionObserver' in window) {
    const heights = [42, 64, 38, 80, 56, 72, 90];
    const io2 = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        bars.querySelectorAll('span').forEach((s, i) => { s.style.height = (heights[i] || 50) + '%'; });
        io2.disconnect();
      }
    }, { threshold: 0.4 });
    io2.observe(bars);
  }

  /* ---- Formulario de contacto ---- */
  const form = document.getElementById('contact-form');
  if (form) {
    const msg = document.getElementById('form-msg');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      form.querySelectorAll('.field.invalid').forEach((f) => f.classList.remove('invalid'));
      msg.className = 'form-msg';
      const data = Object.fromEntries(new FormData(form).entries());
      const btn = form.querySelector('button[type="submit"]');
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Enviando…';
      try {
        const res = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
        const out = await res.json();
        if (res.ok && out.ok) {
          form.reset();
          msg.textContent = out.message || 'Mensaje recibido. Te respondemos en breve.';
          msg.className = 'form-msg ok';
          msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          if (out.errors) {
            for (const k in out.errors) {
              const field = form.querySelector(`[name="${k}"]`)?.closest('.field');
              if (field) { field.classList.add('invalid'); const e = field.querySelector('.err'); if (e) e.textContent = out.errors[k]; }
            }
          }
          msg.textContent = out.message || 'Revisa los campos marcados.';
          msg.className = 'form-msg bad';
        }
      } catch {
        msg.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.';
        msg.className = 'form-msg bad';
      } finally {
        btn.disabled = false; btn.textContent = label;
      }
    });
  }

  /* ---- Año footer ---- */
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
