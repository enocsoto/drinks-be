# drinks-be

API **NestJS** para un billar que vende bebidas (con y sin alcohol) en Colombia: usuarios, catálogo, ventas, analítica y autenticación JWT.

## Stack

- **NestJS 11** (adaptador **Fastify**)
- **MongoDB** + **Mongoose**
- **JWT** (Passport)
- **Swagger** en `/api/docs` (prefijo global `/api`)

## Requisitos

- Node.js LTS
- MongoDB accesible (URI en variables de entorno)

## Setup

```bash
npm install
cp .env.example .env
# Editar .env: MongoDB, JWT_SECRET, CORS_ORIGINS, etc.
```

Detalle de variables: **`.env.example`**. El proyecto usa **npm** (`package-lock.json`); no mezclar con otro gestor.

## Comandos

| Comando | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con recarga |
| `npm run build` | Compilación TypeScript |
| `npm run start:prod` | Producción (`dist/main`) |
| `npm run lint` | ESLint |
| `npm run test` | Tests Jest |
| `npm run seed` | Seed de datos (si aplica) |

Tras cambios en código, conviene ejecutar `npm run lint` y `npm run build`.

## Documentación útil

| Recurso | Ubicación |
|---------|-----------|
| Guía para agentes / humanos | [`AGENTS.md`](./AGENTS.md) |
| Reglas de negocio y dominio (Cursor) | `.cursor/cursorRules/drinks-business-rules/SKILL.md` |
| Módulos (Auth, ventas, bebidas, etc.) | `.cursor/cursorRules/drinks-be-module-docs/SKILL.md` |
| Reglas de estilo NestJS / convenciones | `.cursor/rules/*.mdc` |
| Instrucciones Copilot / CI | [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) |

**Swagger:** con el servidor en marcha, abre `http://localhost:<APP_PORT>/api/docs` (puerto por defecto según `APP_PORT` / `main.ts`).

## Repo hermano

- Frontend: [drinks-fe](../drinks-fe) (Next.js).

---

## Mantenimiento de este README

**Actualiza este archivo** cuando cambien de forma relevante: stack, comandos, puertos, variables de entorno, enlaces a documentación, flujo de setup o integración con `drinks-fe`. Así quien clone el repo obtiene información fiel al estado del proyecto.
