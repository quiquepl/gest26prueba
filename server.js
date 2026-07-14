/* =====================================================
   GEST26 — Servidor web (Express)
   - Sirve la web estática
   - Formulario de contacto (guarda leads en JSON)
   - Panel /admin: edición de textos en vivo + lectura de leads
   ===================================================== */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'prueba';
const ADMIN_PASS = process.env.ADMIN_PASS || 'prueba';
const SESSION_SECRET = process.env.SESSION_SECRET || 'gest26-secret';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'GEST26 Web <onboarding@resend.dev>';
const RESEND_TO = process.env.RESEND_TO || 'sara.imbernon@gest26.com';
// Base de datos opcional (Supabase). Si está configurada, los leads persisten ahí.
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const USE_DB = Boolean(SUPABASE_URL && SUPABASE_KEY);

const esc = (s) => String(s || '—').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

async function resendSend(payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: RESEND_FROM, ...payload }),
  });
  if (!r.ok) console.warn('Resend', payload.to, r.status, await r.text());
}

/* Email interno de aviso (para GEST26). */
function ownerEmailHtml(lead) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#14181c">
    <div style="background:#0e2a52;border-radius:14px 14px 0 0;padding:20px 24px">
      <span style="color:#fff;font-weight:800;letter-spacing:-.02em;font-size:18px">GEST26</span>
      <span style="color:#9ec1ec;font-size:13px;margin-left:8px">Nuevo lead web</span>
    </div>
    <div style="border:1px solid #e0e6ee;border-top:0;border-radius:0 0 14px 14px;padding:22px 24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#6c7886;width:120px">Nombre</td><td style="padding:6px 0"><b>${esc(lead.nombre)}</b></td></tr>
        <tr><td style="padding:6px 0;color:#6c7886">Empresa</td><td style="padding:6px 0">${esc(lead.empresa)}</td></tr>
        <tr><td style="padding:6px 0;color:#6c7886">Email</td><td style="padding:6px 0"><a href="mailto:${esc(lead.email)}" style="color:#356c9c">${esc(lead.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#6c7886">Teléfono</td><td style="padding:6px 0">${esc(lead.telefono)}</td></tr>
        <tr><td style="padding:6px 0;color:#6c7886">Ciudad</td><td style="padding:6px 0">${esc(lead.ciudad)}</td></tr>
        <tr><td style="padding:6px 0;color:#6c7886">Servicio</td><td style="padding:6px 0">${esc(lead.servicio)}</td></tr>
      </table>
      <p style="margin:16px 0 6px;color:#6c7886;font-size:13px">Mensaje</p>
      <div style="background:#e9eef5;border-radius:10px;padding:14px;font-size:14px;white-space:pre-wrap;color:#14181c">${esc(lead.mensaje)}</div>
    </div>
  </div>`;
}

/* Email visual de confirmación para el cliente. */
function clientEmailHtml(lead) {
  const nombre = esc((lead.nombre || '').split(' ')[0] || 'Hola');
  return `
  <div style="background:#f6f8fb;padding:28px 0;font-family:Inter,Arial,sans-serif">
    <div style="max-width:560px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(14,42,82,.10)">
      <div style="background:linear-gradient(135deg,#16386a,#0e2a52);padding:34px 32px">
        <div style="color:#fff;font-weight:800;font-size:22px;letter-spacing:-.02em">GEST26</div>
        <div style="color:#9ec1ec;font-size:12px;letter-spacing:.18em;text-transform:uppercase;margin-top:2px">Gestión y Dirección</div>
      </div>
      <div style="padding:34px 32px">
        <h1 style="margin:0 0 12px;color:#0e2a52;font-size:22px">Gracias, ${nombre}.</h1>
        <p style="color:#45505c;font-size:15px;line-height:1.65;margin:0 0 16px">Hemos recibido tu mensaje y lo estamos revisando. Te responderemos con una primera valoración de tu caso, sin compromiso.</p>
        <p style="color:#45505c;font-size:15px;line-height:1.65;margin:0 0 22px">Mientras tanto, esto es lo que nos has contado:</p>
        <div style="background:#e9eef5;border-left:3px solid #15a06a;border-radius:10px;padding:14px 16px;color:#14181c;font-size:14px;white-space:pre-wrap;margin-bottom:24px">${esc(lead.mensaje)}</div>
        <a href="https://www.linkedin.com/company/gest26/" style="display:inline-block;background:#0e2a52;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 26px;border-radius:999px">Conócenos en LinkedIn</a>
        <p style="color:#6c7886;font-size:12px;line-height:1.6;margin:26px 0 0">GEST26 · Prospección comercial B2B · Burriana, Castellón<br/>Este correo es una confirmación automática de tu solicitud.</p>
      </div>
    </div>
  </div>`;
}

/* Envía los dos correos vía Resend. Best-effort: nunca bloquea ni rompe la respuesta. */
async function sendLeadEmail(lead) {
  if (!RESEND_API_KEY) return;
  // 1) Aviso interno a GEST26
  try {
    await resendSend({
      to: [RESEND_TO],
      reply_to: lead.email,
      subject: `Nuevo lead web: ${lead.nombre}${lead.empresa ? ' · ' + lead.empresa : ''}`,
      html: ownerEmailHtml(lead),
    });
  } catch (err) { console.warn('Aviso interno no enviado:', err.message); }
  // 2) Confirmación al cliente (requiere dominio verificado en Resend para destinatarios externos)
  if (lead.email) {
    try {
      await resendSend({
        to: [lead.email],
        subject: 'Hemos recibido tu mensaje · GEST26',
        html: clientEmailHtml(lead),
      });
    } catch (err) { console.warn('Confirmación al cliente no enviada:', err.message); }
  }
}

const PUBLIC_DIR = join(__dirname, 'public');
const DATA_DIR = join(__dirname, 'data');
const CONTENT_FILE = join(DATA_DIR, 'content.json');
const LEADS_FILE = join(DATA_DIR, 'leads.json');
const POSTS_FILE = join(DATA_DIR, 'posts.json');
const SECTIONS_FILE = join(DATA_DIR, 'sections.json');
const UPLOADS_DIR = join(PUBLIC_DIR, 'uploads');

/* ---------- Contenido editable por defecto ---------- */
const DEFAULT_CONTENT = {
  hero_badge: 'Prospección comercial B2B · Burriana, Castellón',
  hero_title: 'Inteligencia comercial B2B',
  hero_em: '',
  hero_subtitle: 'Servicios comerciales integrales para empresas.',
  hero_cta: 'Solicitar diagnóstico comercial',
  hero_cta2: 'Ver cómo trabajamos',
  hero_support: 'Sin campañas masivas. Sin leads sin contexto. Sin perder el control de tu marca.',

  problema_title:
    'Tu equipo comercial no necesita más contactos. Necesita conversaciones que puedan convertirse en negocio.',
  problema_text:
    'Muchas empresas tienen bases de datos sin trabajar, clientes antiguos sin contactar, oportunidades paradas o equipos saturados. El problema rara vez es la falta de mercado: es la falta de tiempo, método y seguimiento para activar esas oportunidades.',

  valor_title: 'No hacemos campañas masivas. Activamos oportunidades comerciales con criterio.',
  valor_text:
    'Cada contacto representa tu marca. Trabajamos con mensajes cuidados, investigación previa y prospección adaptada al cliente que quieres captar. El objetivo no es llenar una hoja de cálculo de leads, sino generar reuniones con empresas que encajan con tu oferta.',

  metodo_title: 'Cómo trabaja GEST26',
  servicios_title: 'Qué puedes contratar',
  reporting_title: 'No solo entregamos citas. Entregamos información para decidir mejor.',
  reporting_text:
    'Cada semana sabes qué se ha hecho, qué ha respondido el mercado, qué objeciones aparecen y qué oportunidades conviene priorizar.',
  sectores_title: 'Para qué tipo de empresas trabajamos',
  compara_title: 'No es lo mismo hacer llamadas que construir prospección con criterio',
  faq_title: 'Preguntas frecuentes',

  cta_title: '¿Conseguir clientes o recuperar oportunidades?',
  cta_text:
    'Cuéntanos qué quieres captar o reactivar. Revisamos tu caso y vemos si GEST26 encaja. Sin compromiso.',
  cta_button: 'Solicitar diagnóstico comercial',

  contacto_title: 'Hablemos de tu proceso comercial',
  contacto_text:
    'Cuéntanos qué clientes quieres conseguir, qué oportunidades quieres recuperar o qué parte de tu proceso comercial necesitas reforzar. Respondemos con una primera valoración, sin compromiso.',

  footer_text:
    'GEST26 — Prospección comercial B2B, recuperación de clientes y generación de citas cualificadas.',
  contact_email: 'sara.imbernon@gest26.com',
  contact_phone: '+34 610 42 46 42',
  linkedin_url: 'https://www.linkedin.com/company/gest26/',
};

/* ---------- Publicaciones (estilo LinkedIn) ----------
   Contenido temático editable. No incluye cifras ni fechas inventadas. */
const DEFAULT_POSTS = [
  {
    id: 'p1',
    title: 'Calidad sobre volumen: por qué menos contactos venden más',
    date: '',
    excerpt: 'En prospección B2B, una conversación con la persona adecuada vale más que cien envíos sin contexto. Así lo enfocamos.',
    url: 'https://www.linkedin.com/company/gest26/',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=70&auto=format&fit=crop',
  },
  {
    id: 'p2',
    title: 'Cartera dormida: oportunidades que ya conocen tu marca',
    date: '',
    excerpt: 'Clientes antiguos y presupuestos sin cerrar siguen siendo negocio. Reactivarlos con criterio suele ser el camino más corto.',
    url: 'https://www.linkedin.com/company/gest26/',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=900&q=70&auto=format&fit=crop',
  },
  {
    id: 'p3',
    title: 'Llegar a decisores reales sin sonar a spam',
    date: '',
    excerpt: 'Investigar antes de escribir y adaptar el mensaje al sector cambia por completo la respuesta. Cuidar la marca es parte del trabajo.',
    url: 'https://www.linkedin.com/company/gest26/',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=70&auto=format&fit=crop',
  },
];

/* ---------- Utilidades de almacenamiento ---------- */
async function ensureData() {
  if (USE_DB) return; // con base de datos no se crean ficheros locales
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(CONTENT_FILE)) await writeFile(CONTENT_FILE, JSON.stringify(DEFAULT_CONTENT, null, 2), 'utf8');
  if (!existsSync(LEADS_FILE)) await writeFile(LEADS_FILE, '[]', 'utf8');
  if (!existsSync(POSTS_FILE)) await writeFile(POSTS_FILE, JSON.stringify(DEFAULT_POSTS, null, 2), 'utf8');
  if (!existsSync(SECTIONS_FILE)) await writeFile(SECTIONS_FILE, '[]', 'utf8');
  if (!existsSync(UPLOADS_DIR)) await mkdir(UPLOADS_DIR, { recursive: true });
}

/* ---------- Almacén clave-valor en Supabase (textos, posts, secciones) ---------- */
async function kvGet(key) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/kv?key=eq.${key}&select=value`, { headers: sbHeaders() });
  if (!r.ok) throw new Error('kv get ' + r.status);
  const rows = await r.json();
  return rows[0] ? rows[0].value : null;
}
async function kvSet(key, value) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/kv`, {
    method: 'POST',
    headers: sbHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({ key, value }),
  });
  if (!r.ok) throw new Error('kv set ' + r.status + ' ' + (await r.text()));
}

async function readPosts() {
  if (USE_DB) { try { const v = await kvGet('posts'); return Array.isArray(v) ? v : [...DEFAULT_POSTS]; } catch (e) { console.warn('posts read:', e.message); return [...DEFAULT_POSTS]; } }
  try { return JSON.parse(await readFile(POSTS_FILE, 'utf8')); } catch { return [...DEFAULT_POSTS]; }
}
async function savePosts(arr) {
  if (USE_DB) return kvSet('posts', arr);
  return writeFile(POSTS_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

async function readSections() {
  if (USE_DB) { try { const v = await kvGet('sections'); return Array.isArray(v) ? v : []; } catch { return []; } }
  try { return JSON.parse(await readFile(SECTIONS_FILE, 'utf8')); } catch { return []; }
}
async function saveSections(arr) {
  if (USE_DB) return kvSet('sections', arr);
  return writeFile(SECTIONS_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

async function readContent() {
  if (USE_DB) { try { const v = await kvGet('content'); return { ...DEFAULT_CONTENT, ...(v || {}) }; } catch { return { ...DEFAULT_CONTENT }; } }
  try { const raw = await readFile(CONTENT_FILE, 'utf8'); return { ...DEFAULT_CONTENT, ...JSON.parse(raw) }; } catch { return { ...DEFAULT_CONTENT }; }
}
async function saveContent(obj) {
  if (USE_DB) return kvSet('content', obj);
  return writeFile(CONTENT_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

/* ---------- Almacenamiento de leads (Supabase si está configurado, si no fichero) ---------- */
function sbHeaders(extra) {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', ...extra };
}
async function readLeads() {
  if (USE_DB) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=*&order=received_at.desc`, { headers: sbHeaders() });
      if (!r.ok) throw new Error('status ' + r.status);
      const rows = await r.json();
      return rows.map((row) => ({ ...(row.data || {}), id: row.id, receivedAt: row.received_at, leido: !!row.leido }));
    } catch (e) { console.warn('Leads DB read:', e.message); return []; }
  }
  try { return JSON.parse(await readFile(LEADS_FILE, 'utf8')); } catch { return []; }
}
async function addLead(lead) {
  if (USE_DB) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST', headers: sbHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ id: lead.id, received_at: lead.receivedAt, leido: false, data: lead }),
    });
    if (!r.ok) throw new Error('insert ' + r.status + ' ' + (await r.text()));
    return;
  }
  const leads = await readLeads();
  leads.unshift(lead);
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}
async function setLeadRead(id, leido) {
  if (USE_DB) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: sbHeaders({ Prefer: 'return=minimal' }), body: JSON.stringify({ leido }),
    });
    return r.ok;
  }
  const leads = await readLeads();
  const l = leads.find((x) => x.id === id);
  if (!l) return false;
  l.leido = leido;
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
  return true;
}
async function removeLead(id) {
  if (USE_DB) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE', headers: sbHeaders({ Prefer: 'return=minimal' }),
    });
    return r.ok;
  }
  let leads = await readLeads();
  leads = leads.filter((x) => x.id !== id);
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
  return true;
}

/* ---------- Tokens de sesión (firmados, sin estado) ---------- */
function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}
function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
function requireAuth(req, res, next) {
  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!verify(token)) return res.status(401).json({ ok: false, message: 'No autorizado.' });
  next();
}

/* ---------- App ---------- */
const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '32kb' }));

// Rate limiting simple en memoria
const WINDOW_MS = 60_000;
const MAX_REQ = 12;
const hits = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, reset: now + WINDOW_MS };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + WINDOW_MS; }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > MAX_REQ) return res.status(429).json({ ok: false, message: 'Demasiadas solicitudes. Prueba en un minuto.' });
  next();
}

/* ---------- Validación del formulario ---------- */
const contactSchema = z.object({
  nombre: z.string().trim().min(2, 'Dinos cómo te llamas.').max(80),
  empresa: z.string().trim().max(100).optional().or(z.literal('')),
  email: z.string().trim().email('Introduce un email válido.').max(120),
  telefono: z.string().trim().max(30).optional().or(z.literal('')),
  ciudad: z.string().trim().max(80).optional().or(z.literal('')),
  servicio: z.string().trim().max(80).optional().or(z.literal('')),
  mensaje: z.string().trim().min(10, 'Cuéntanos un poco más (mín. 10 caracteres).').max(1500),
  website: z.string().max(200).optional(), // honeypot
});

/* ---------- API pública ---------- */
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get('/api/content', async (_req, res) => {
  res.json(await readContent());
});

app.get('/api/posts', async (_req, res) => {
  res.json(await readPosts());
});

app.get('/api/sections', async (_req, res) => {
  res.json(await readSections());
});

app.post('/api/contact', rateLimit, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const errors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return res.status(422).json({ ok: false, message: 'Revisa los campos marcados.', errors });
  }
  if (parsed.data.website && parsed.data.website.trim()) {
    return res.status(200).json({ ok: true, message: 'Mensaje recibido.' }); // honeypot
  }
  const lead = {
    id: crypto.randomUUID(),
    nombre: parsed.data.nombre,
    empresa: parsed.data.empresa || '',
    email: parsed.data.email,
    telefono: parsed.data.telefono || '',
    ciudad: parsed.data.ciudad || '',
    servicio: parsed.data.servicio || '',
    mensaje: parsed.data.mensaje,
    receivedAt: new Date().toISOString(),
    leido: false,
  };
  try {
    await addLead(lead);
    sendLeadEmail(lead); // best-effort, no bloquea la respuesta
    return res.status(201).json({ ok: true, message: 'Mensaje recibido. Te respondemos en breve.' });
  } catch (err) {
    console.warn('Error guardando lead:', err.message);
    // Aunque falle el guardado, el email ya avisa: no perdemos el contacto.
    sendLeadEmail(lead);
    return res.status(201).json({ ok: true, message: 'Mensaje recibido. Te respondemos en breve.' });
  }
});

/* ---------- API admin ---------- */
app.post('/api/admin/login', rateLimit, (req, res) => {
  const { usuario, password } = req.body || {};
  if (usuario === ADMIN_USER && password === ADMIN_PASS) {
    const token = sign({ u: usuario, exp: Date.now() + 1000 * 60 * 60 * 8 }); // 8h
    return res.json({ ok: true, token });
  }
  return res.status(401).json({ ok: false, message: 'Usuario o contraseña incorrectos.' });
});

app.get('/api/admin/content', requireAuth, async (_req, res) => {
  res.json({ ok: true, content: await readContent(), defaults: DEFAULT_CONTENT });
});

app.post('/api/admin/content', requireAuth, async (req, res) => {
  const incoming = req.body || {};
  const current = await readContent();
  const next = { ...current };
  for (const key of Object.keys(DEFAULT_CONTENT)) {
    if (typeof incoming[key] === 'string') next[key] = incoming[key];
  }
  await saveContent(next);
  res.json({ ok: true, content: next });
});

app.get('/api/admin/posts', requireAuth, async (_req, res) => {
  res.json({ ok: true, posts: await readPosts() });
});

app.post('/api/admin/posts', requireAuth, async (req, res) => {
  const incoming = Array.isArray(req.body?.posts) ? req.body.posts : null;
  if (!incoming) return res.status(400).json({ ok: false, message: 'Formato no válido.' });
  const clean = incoming.slice(0, 30).map((p, i) => ({
    id: String(p.id || 'p' + (i + 1)),
    title: String(p.title || '').slice(0, 160),
    date: String(p.date || '').slice(0, 40),
    excerpt: String(p.excerpt || '').slice(0, 600),
    url: String(p.url || '').slice(0, 300),
    image: String(p.image || '').slice(0, 400),
  }));
  await savePosts(clean);
  res.json({ ok: true, posts: clean });
});

/* Secciones personalizadas (editor del cliente) */
const SECTION_TYPES = ['banner', 'split', 'texto', 'cta'];
app.get('/api/admin/sections', requireAuth, async (_req, res) => {
  res.json({ ok: true, sections: await readSections() });
});
app.post('/api/admin/sections', requireAuth, async (req, res) => {
  const incoming = Array.isArray(req.body?.sections) ? req.body.sections : null;
  if (!incoming) return res.status(400).json({ ok: false, message: 'Formato no válido.' });
  const clean = incoming.slice(0, 20).map((s, i) => ({
    id: String(s.id || 's' + (i + 1)),
    type: SECTION_TYPES.includes(s.type) ? s.type : 'texto',
    eyebrow: String(s.eyebrow || '').slice(0, 80),
    title: String(s.title || '').slice(0, 160),
    text: String(s.text || '').slice(0, 1000),
    image: String(s.image || '').slice(0, 400),
    cta_text: String(s.cta_text || '').slice(0, 60),
    cta_url: String(s.cta_url || '').slice(0, 300),
    theme: s.theme === 'dark' ? 'dark' : 'light',
  }));
  await saveSections(clean);
  res.json({ ok: true, sections: clean });
});

/* Subida de imágenes (base64). Límite ampliado solo en esta ruta. */
app.post('/api/admin/upload', requireAuth, express.json({ limit: '8mb' }), async (req, res) => {
  const { dataUrl } = req.body || {};
  const m = typeof dataUrl === 'string' && dataUrl.match(/^data:image\/(png|jpe?g|webp|gif|avif);base64,(.+)$/);
  if (!m) return res.status(400).json({ ok: false, message: 'Imagen no válida.' });
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 6 * 1024 * 1024) return res.status(413).json({ ok: false, message: 'Máx. 6 MB.' });
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  if (USE_DB) {
    try {
      const up = await fetch(`${SUPABASE_URL}/storage/v1/object/uploads/${name}`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': m[1] === 'svg' ? 'image/svg+xml' : `image/${m[1]}` },
        body: buf,
      });
      if (!up.ok) throw new Error('storage ' + up.status + ' ' + (await up.text()));
      return res.json({ ok: true, url: `${SUPABASE_URL}/storage/v1/object/public/uploads/${name}` });
    } catch (e) {
      console.warn('Upload DB:', e.message);
      return res.status(500).json({ ok: false, message: 'No se pudo subir la imagen.' });
    }
  }
  await writeFile(join(UPLOADS_DIR, name), buf);
  res.json({ ok: true, url: `/uploads/${name}` });
});

app.get('/api/admin/leads', requireAuth, async (_req, res) => {
  res.json({ ok: true, leads: await readLeads() });
});

app.post('/api/admin/leads/:id', requireAuth, async (req, res) => {
  const leido = req.body && typeof req.body.leido === 'boolean' ? req.body.leido : true;
  const ok = await setLeadRead(req.params.id, leido);
  res.status(ok ? 200 : 404).json({ ok });
});

app.delete('/api/admin/leads/:id', requireAuth, async (req, res) => {
  await removeLead(req.params.id);
  res.json({ ok: true });
});

/* ---------- Estático ---------- */
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));
app.get('/', (_req, res) => res.sendFile(join(PUBLIC_DIR, 'index.html')));

/* Arranca el servidor solo fuera de entornos serverless (local / Render).
   En Vercel se importa `app` como función y no se llama a listen. */
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    await ensureData();
    console.log(`GEST26 web en http://localhost:${PORT}`);
    console.log(`Panel admin en http://localhost:${PORT}/admin  (usuario: ${ADMIN_USER})`);
  });
}

export default app;
export { app };
