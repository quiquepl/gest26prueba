# GEST26 — Web + Admin + Formulario

Web de prospección comercial B2B con panel de administración, formulario que registra leads y avisos por email (Resend).

## Ejecutar en local

```bash
npm install
cp .env.example .env   # rellena tus claves
npm start
```
- Web: http://localhost:3000
- Admin: http://localhost:3000/admin  (usuario/contraseña según tu `.env`)

## Publicar online con backend (Render — gratis)

GitHub solo guarda el código; **no ejecuta el servidor**. Para que el formulario, el admin y los emails funcionen online, despliega en un hosting Node. Pasos con **Render**:

1. Entra en https://render.com y regístrate con tu cuenta de GitHub.
2. **New +** → **Blueprint** → elige el repo `quiquepl/gest26prueba`. Render detecta `render.yaml`.
3. Te pedirá las variables de entorno. Rellena:
   - `ADMIN_USER` y `ADMIN_PASS` (acceso al panel /admin)
   - `RESEND_API_KEY` (tu clave de Resend, empieza por `re_`)
   - `RESEND_TO` (email donde quieres recibir los avisos de leads)
   - `SESSION_SECRET` se genera solo.
4. **Apply** / **Create**. En 1-2 min tendrás una URL pública tipo `https://gest26.onrender.com`.
5. Cada vez que hagas push a `main`, Render vuelve a desplegar solo.

### Emails (Resend)
- El **aviso interno** (a `RESEND_TO`) funciona desde el primer momento.
- El **email de confirmación al cliente** y el envío a cualquier dirección requieren **verificar tu dominio** en https://resend.com/domains y cambiar `RESEND_FROM` a un correo de tu dominio (ej. `GEST26 <hola@gest26.com>`). En modo prueba Resend solo entrega a la cuenta propietaria.

### Leads permanentes con Supabase (gratis, recomendado)
Para que los formularios **queden guardados para siempre** y se vean en `/admin` aunque el servidor se reinicie:
1. Crea una cuenta gratis en https://supabase.com y un proyecto nuevo.
2. En el proyecto, ve a **SQL Editor** y ejecuta:
   ```sql
   create table if not exists leads (
     id text primary key,
     received_at timestamptz,
     leido boolean default false,
     data jsonb
   );
   ```
3. En **Project Settings → API** copia:
   - **Project URL** → variable `SUPABASE_URL`
   - **service_role** key (secret) → variable `SUPABASE_KEY`
4. Pega esas dos variables en Render (o en tu `.env`). Al reiniciar, los leads se guardan en Supabase automáticamente.

Si dejas `SUPABASE_URL`/`SUPABASE_KEY` vacías, la web sigue funcionando guardando en fichero (pero se pierde al redesplegar). En cualquier caso, el **email de aviso** siempre te llega como copia.

## Qué hace
- Formulario → valida, guarda el lead y envía 2 emails (aviso a ti + confirmación al cliente).
- `/admin`: edita textos, gestiona secciones (con subida de imágenes), publica Actualidad y consulta/gestiona los leads recibidos.
