# Deploy (Cloudflare Pages + D1)

## Secretos y variables (GitHub / local)

| Nombre | Dónde | Uso |
|--------|--------|-----|
| `CLOUDFLARE_API_TOKEN` | GitHub Actions secret; opcionalmente `.dev.vars` local | Token con permisos **Account → Cloudflare Pages → Edit** (y lectura de cuenta según política). |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secret (recomendado) | Account ID visible en el dashboard de Cloudflare. Algunos tokens lo requieren para `wrangler pages deploy`. |

No commitees valores reales. `SESSION_SECRET` es para la API en Pages (configuración del proyecto en Cloudflare, no en este archivo).

## Binding D1

En el proyecto Pages: **Settings → Functions → D1 database bindings** → nombre `DB` → base `jap_vocab_db` (como en `wrangler.toml`).

## Migraciones

**No** se ejecutan en CI por defecto. Cuando agregues un archivo en `migrations/`:

```bash
npm run db:migrate:remote
```

## Deploy manual

```bash
npm ci
npm run build
npm run deploy:pages
```

Con variables de entorno: `CLOUDFLARE_API_TOKEN`, y si aplica `CLOUDFLARE_ACCOUNT_ID`.

## Deploy automático

Push a `main` dispara `.github/workflows/deploy-cloudflare-pages.yml` (build + `npm run deploy:pages`).

## Proyecto Pages

Nombre por defecto en el repo: `jap-vocab-web` (script `deploy:pages` en `package.json`). Debe coincidir con el nombre del proyecto en Cloudflare Pages.
