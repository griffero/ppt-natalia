# ppt-natalia (QR compromisos)

App para dinámica de presentación:

- **Form (QR)**: `/` (iniciales + compromisos)
- **Wall**: `/wall` (muro bonito + QR al form, auto-refresh)

## Deploy en Render (producción)

Está listo para **Render Blueprint** con Postgres persistente.

1. En Render: **New → Blueprint**
2. Selecciona este repo (GitHub) y despliega el `render.yaml`

Render creará:

- **Postgres**: `ppt-natalia-db`
- **Web service**: `ppt-natalia` (Express sirve API + frontend compilado)

## Variables / tokens necesarios

- **Tokens**: ninguno si deployas vía UI conectando GitHub.
- **Si quieres automatizar vía API**: necesitarías un **Render API Key** (no es obligatorio).

Variables de entorno que Render configura / usa:

- **`DATABASE_URL`**: se inyecta desde el Postgres (Blueprint `fromDatabase`)
- **`NODE_VERSION`**: fijada a `22.12.0` en `render.yaml`

Opcional:

- **`ADMIN_TOKEN`**: habilita reset del wall:
  - `DELETE /api/commitments` con header `Authorization: Bearer <ADMIN_TOKEN>`

## Dev local (opcional)

En una terminal:

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

En otra:

```bash
cd frontend
npm install
npm run dev
```


