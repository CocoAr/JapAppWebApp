# Jap Vocab (web)

Aplicación web para practicar vocabulario japonés (hiragana → español) para un grupo pequeño: cuentas con usuario + PIN, progreso por usuario en **Cloudflare D1**, frontend estático y API en **Cloudflare Pages Functions**.

## Stack

- **Frontend:** React, TypeScript, Vite
- **Hosting:** Cloudflare Pages
- **API:** Pages Functions (`/functions`)
- **Base de datos:** D1 (SQLite)
- **Estilo:** CSS oscuro minimalista (`src/index.css`)

## Requisitos

- Node.js 20+ (recomendado)
- Cuenta de Cloudflare (gratis) para despliegue

## Configuración local

### 1. Dependencias

```bash
npm install
```

### 2. Variables de entorno locales

Copiá el ejemplo y ajustá el secreto de sesión:

```bash
copy .dev.vars.example .dev.vars
```

`SESSION_SECRET` debe ser una cadena larga y aleatoria (32+ caracteres). En producción se configura como **Secret** en Cloudflare (ver más abajo), no como variable pública.

### 3. Base de datos D1 local

Las migraciones viven en `migrations/`. Aplicá el esquema a la base local:

```bash
npx wrangler d1 migrations apply jap_vocab_db --local
```

Esto aplica también la migración de la celebración (`0002_vocab_celebration.sql`).

### 3.1 Assets de celebración

Asegurate de tener estos archivos en `public/assets/celebration/`:

- `omedetou-congratulations.gif`
- `good-or-don-t-be_6tqUK6cZ.mp3`

Con eso, el popup + audio se cargan automáticamente cuando corresponda.

### 4. Compilar el frontend una vez

La API de Wrangler sirve la carpeta `dist/` (assets construidos). Primero generá `dist`:

```bash
npm run build
```

Atajo para pasos 3 + 4:

```bash
npm run dev:setup
```

### 5. Desarrollo en dos terminales

**Terminal A — API + Pages Functions + D1 local (puerto 8788):**

```bash
npm run dev:api
```

**Terminal B — Vite con recarga rápida del frontend (puerto 5173):**

```bash
npm run dev
```

El proxy de Vite reenvía las rutas `/api/*` a `http://127.0.0.1:8788`, así el navegador usa un solo origen lógico en el puerto de Vite y las cookies de sesión funcionan.

Abrí **http://127.0.0.1:5173** (no hace falta abrir el 8788 para el día a día).

Si cambiás código en `functions/`, reiniciá `npm run dev:api`. Si cambiás solo el frontend, Vite recarga solo.

### Comandos útiles

| Comando | Descripción |
|--------|-------------|
| `npm run build` | `tsc --noEmit` + build de Vite → `dist/` |
| `npm run dev:setup` | Migraciones locales D1 + build inicial de `dist/` |
| `npm run dev` | Solo Vite (necesita `dev:api` para `/api`) |
| `npm run dev:api` | Wrangler Pages dev sobre `dist/` + Functions + D1 local |
| `npm run preview` | Servir `dist` con Wrangler (sin Vite) |
| `npm run db:migrate:local` | Aplicar migraciones D1 locales |
| `npm run db:migrate:remote` | Aplicar migraciones al D1 remoto (producción) |

## Datos de vocabulario

El dataset completo está en `src/data/vocabulary.json`. Cada palabra tiene **un solo tema** (taxonomía en español, ver `scripts/vocab-taxonomy-data.mjs`). El build falla si una palabra tiene 0 o más de un tema (`npm run validate:vocab`). Migración de IDs de tema en D1: `migrations/0003_topic_taxonomy.sql` y `docs/TAXONOMY_MIGRATION.md`.

Tipos y helpers: `src/data/vocabulary.ts`.

## API (Pages Functions)

Rutas implementadas:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/register` | Alta usuario + PIN (hash + sal) |
| `POST` | `/api/login` | Login; cookie HttpOnly firmada |
| `POST` | `/api/logout` | Borra cookie de sesión |
| `GET` | `/api/me` | Usuario actual (requiere sesión) |
| `GET` | `/api/progress` | Progreso de palabras y categorías |
| `POST` | `/api/progress/word` | Actualizar estado de una palabra (`known` / `weak`) |
| `POST` | `/api/progress/session` | Guardar resultado de sesión (modo `page` o `topic`) |
| `POST` | `/api/progress/category-started` | Marcar categoría como iniciada (tarjetas no grises) |
| `POST` | `/api/progress/vocab-celebration-seen` | Marcar como visto el popup de celebración global |

`GET /api/categories/page` y `GET /api/categories/topic` están alias a `GET /api/progress` para compatibilidad con la especificación.

## Despliegue en Cloudflare Pages

### 1. Crear base D1

```bash
npx wrangler d1 create jap_vocab_db
```

Copiá el **database_id** que muestra Wrangler.

### 2. `wrangler.toml`

Editá `wrangler.toml` y reemplazá `database_id` en `[[d1_databases]]` por el UUID real de tu base D1.

### 3. Migraciones remotas

```bash
npx wrangler d1 migrations apply jap_vocab_db --remote
```

### 4. Secreto de sesión

```bash
npx wrangler pages secret put SESSION_SECRET --project-name=TU_PROYECTO_PAGES
```

Introducí un valor largo y aleatorio. No lo commitees.

### 5. Proyecto Pages

1. En el dashboard: **Workers & Pages** → **Create** → **Pages** → **Connect to Git** (o subí `dist` con **Direct Upload**).
2. Configuración de build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** raíz del repo (donde está `package.json` y `wrangler.toml`)
3. Asociá el binding **D1** al proyecto Pages:
   - Settings → **Functions** → **D1 database bindings** → mismo nombre que en `wrangler.toml`: `DB` → base `jap_vocab_db`.
4. Añadí el secret `SESSION_SECRET` como en el paso 4.

### 6. Desplegar con Wrangler CLI (alternativa)

Tras login:

```bash
npx wrangler pages deploy dist --project-name=TU_PROYECTO_PAGES
```

Asegurate de que el proyecto Pages tenga vinculados D1 y `SESSION_SECRET` como arriba.

## GitHub Actions (opcional)

El workflow `.github/workflows/deploy-cloudflare-pages.yml` despliega en cada push a `main`. Configurá en el repositorio:

- `CLOUDFLARE_API_TOKEN` — permisos de Pages y D1 según tu política
- `CLOUDFLARE_ACCOUNT_ID`
- Ajustá `project_name` y el nombre de la base D1 en el YAML si difieren.

## Seguridad (recordatorio)

- El PIN no se guarda en claro; se usa **PBKDF2-SHA256** con sal aleatoria.
- La sesión es una cookie **HttpOnly** firmada con **HMAC-SHA256** (`SESSION_SECRET`).
- No hay recuperación de PIN ni correo: es una app de grupo cerrado.

## Estructura del repo

```
├── functions/           # Pages Functions (API)
├── migrations/          # SQL D1
├── src/
│   ├── data/            # vocabulary.json + vocabulary.ts
│   ├── pages/           # Pantallas
│   ├── components/
│   ├── context/
│   └── lib/
├── dist/                # Salida de Vite (generada)
├── wrangler.toml
└── package.json
```

## Licencia / uso

Uso privado del grupo de estudio; adaptá según vuestras necesidades.
