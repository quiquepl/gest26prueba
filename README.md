# GEST26 — Web + Admin

Web de prospección comercial B2B con panel de administración y formulario de contacto.

## Arrancar

```bash
npm install
npm start
```

- Web: http://localhost:3000
- Admin: http://localhost:3000/admin  (usuario: `prueba` · contraseña: `prueba`)

Configura puerto y credenciales en `.env`.

## Estructura

- `server.js` — API (contacto, contenido editable, admin) y servidor estático.
- `public/` — `index.html`, `servicios.html`, `contacto.html`, `admin.html`, `css/`, `js/`.
- `data/content.json` — textos editables (se regenera con valores por defecto si se borra).
- `data/leads.json` — mensajes del formulario.

## Qué puede editar el admin

Textos y titulares de todas las secciones, datos de contacto (email, teléfono, LinkedIn) y pie. Los cambios se reflejan en la web al recargar. También ve, marca como leídos y elimina los mensajes del formulario.

## Pendiente (cuando quieras)

- Email, teléfono y LinkedIn reales → editables desde el admin.
- Conectar `data/leads.json` a una base de datos externa si se necesita.
- Sustituir el wordmark `G26` por el logo definitivo.
- Cambiar `ADMIN_USER`, `ADMIN_PASS` y `SESSION_SECRET` en `.env` antes de producción.
