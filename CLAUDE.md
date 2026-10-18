# coremodel-fondecyt-node

API Express + TypeScript que extrae indicadores sociales de fuentes abiertas (BCN, Mineduc) y los guarda en MongoDB, más el documento de tesis en LaTeX (`docs/tesis/`). Stack: Node 22 (LTS Jod, ver `.nvmrc`), TypeScript 5, Express 4, Mongoose 6, zod 4, Jest y Docker Compose (MongoDB, mongo-express, Metabase). El detalle de instalación y operación está en el [README](README.md).

## Comandos

- `npm run dev`: servidor con nodemon + ts-node (`src/app.ts`).
- `npm run build`: compila con `tsc -p tsconfig.build.json` a `dist/`.
- `npm run typecheck`: `tsc -p . --noEmit`, incluye `test/`.
- `npm run lint` / `npm run lint:fix`: ESLint sobre `.ts`.
- `npm test`: Jest.
- `docker compose up -d`: levanta los servicios de infraestructura.

## Arquitectura

Cada módulo vive en `src/modules/<modulo>` y se compone de:

- `config.ts`: declara los indicadores del módulo con `IndicatorBuilder` (`src/core/IndicatorBuilder.ts`), validados con zod.
- `index.ts`: clase que extiende `ScrapeBase` (`src/core/ScrapeBase.ts`) con el nombre del módulo y su config.
- Por indicador: `parse-adapter.ts`, `mapper.ts`, `hash.ts`, `storage-adapter.ts`, `schema.ts` e `interfaces.ts`; opcionalmente `calculator-adapter.ts`.

`src/app.ts` registra cada scraper en `ScraperFactory` (singleton en `src/core/ScraperFactory.ts`). Las rutas están en `src/api/routes/<modulo>.route.ts` y los adaptadores base en `src/core/adapters/`. `CronRegistry` programa la ejecución según la frecuencia del indicador.

`ScrapeBase.init` ejecuta el pipeline: fetch → parse → mapper → hash → storage, y al final el calculator si el indicador lo define.

Para agregar un indicador: crear su carpeta con los adaptadores, declararlo en el `config.ts` del módulo con `IndicatorBuilder` y sumar sus tests en `test/`. Para agregar un módulo: crear `src/modules/<modulo>/` con `config.ts` e `index.ts`, registrarlo en `src/app.ts` y crear su ruta en `src/api/routes/`.

El nombre del módulo en la API sale de `super("<nombre>", ...)` y no siempre coincide con la carpeta (carpeta `emergencias-desastres`, módulo `emergencia-desastres`).

## API

- `GET /`: resumen de módulos. `GET /<modulo>`: lista de indicadores del módulo.
- `POST /<modulo>/:indicator`: ejecuta el scraping, guarda en MongoDB y recalcula resultados. En `biblioteca-congreso-nacional/valdivia-tasa-pobreza-ingresos` requiere `?year=YYYY`.
- `GET /<modulo>/:indicator`: lee lo guardado, sin scrapear. `GET /<modulo>/:indicator/result`: último resultado calculado.
- Errores (`src/api/error-handler.ts`): `DomainError` → 400, `ServiceError` (`FetchError`, `StorageError`) → 502, cualquier otro → 500.
- Todo cambio de endpoints se documenta en la colección Bruno de `docs/api/` (skill `bruno-endpoints`).

## Convenciones de código

- Prettier y ESLint del repo (`.prettierrc.json`, `.eslintrc.json` con `standard-with-typescript`): tabs, comillas dobles, sin trailing commas.
- Nombres en inglés en el código; archivos de módulo en kebab-case.
- Los tests en `test/` reflejan la estructura de `src/`.
- Sin comentarios en el código.

## Git

- Se trabaja en `develop`. `main` recibe releases con `merge: develop into main for vX.Y.Z` y tags `vX.Y.Z`.
- Commits con la skill `git-commit`: Conventional Commits, una línea, en inglés, sin firma de IA.
- Scopes en uso: `api`, `core`, `docker`, `readme`, `thesis`, `skills`, `changelog`, `metabase`, `mongo`, `eslint`, `emergencias-desastres`.
- Hook pre-commit de husky con lint-staged (`eslint --fix` + `prettier --write` sobre `*.ts`). No se salta con `--no-verify`.

## Configuración de skills

Estos valores mandan sobre los de las skills:

- `release-changelog`: carpeta `docs/changelogs/`, rama base `main`, idioma español y encabezados de la plantilla en inglés.
- `bruno-endpoints`: colección `docs/api/`, archivos en kebab-case, 2 espacios, docs en español con H1, `**Auth:** public` y secciones `Path params`, `Query`, `Response 200` y `Errors` con los mensajes exactos.
- Las skills se instalaron con skills.sh (`-a claude-code`) en `.claude/skills/` y están versionadas. No se editan a mano: se actualizan con `npx skills update -p`.

## Tesis

- Documento: `docs/tesis/tesis.tex`. Al editarlo se aplica la skill `thesis-format`.
- Compilar: `bash .claude/skills/thesis-build/build.sh docs/tesis/tesis.tex --out docs/tesis`.
- El PDF se versiona y se recompila tras cada cambio (commit `docs(thesis): rebuild pdf`).
