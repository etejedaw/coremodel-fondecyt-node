# coremodel-fondecyt-node

API Express + TypeScript que extrae indicadores sociales de fuentes abiertas (BCN, Mineduc) y los guarda en MongoDB, más el documento de tesis en LaTeX (`docs/tesis/`). Las versiones de librerías están en `package.json` y la de Node en `.nvmrc`. Instalación, scripts npm y operación: [README](README.md).

## Documentación

`docs/README.md` es el índice. Antes de tocar un área, lee el archivo de `docs/` que le corresponda:

- Arquitectura, pipeline y componentes del core: [`docs/architecture.md`](docs/architecture.md) y [`docs/context/modules.md`](docs/context/modules.md) (anatomía de módulos y cómo agregar indicadores o módulos).
- Endpoints: [`docs/api/`](docs/api/). Errores y su mapeo a HTTP: [`docs/context/errors.md`](docs/context/errors.md).
- Convenciones de código, tests, git y commits: [`docs/context/conventions.md`](docs/context/conventions.md).

Reglas:

- Todo cambio de endpoints se documenta en `docs/api/` con la skill `bruno-endpoints`.
- Si cambias algo que un archivo de `docs/` o la tesis describe, actualízalo en el mismo cambio. Las reglas están en [`docs/README.md`](docs/README.md).

## Configuración de skills

Estos valores mandan sobre los de las skills:

- `release-changelog`: carpeta `docs/changelogs/`, rama base `main`, idioma español y encabezados de la plantilla en inglés.
- `bruno-endpoints`: colección `docs/api/`, archivos en kebab-case, 2 espacios, docs en español con H1, `**Auth:** public` y secciones `Path params`, `Query`, `Response 200` y `Errors` con los mensajes exactos.
- Las skills se instalaron con skills.sh (`-a claude-code`) en `.claude/skills/` y están versionadas; no se editan a mano. Cómo actualizarlas: [README](README.md#documento-de-tesis).

## Tesis

- Documento: `docs/tesis/tesis.tex`. Al editarlo se aplica la skill `thesis-format`.
- El PDF se versiona y se recompila tras cada cambio (commit `docs(thesis): rebuild pdf`). El comando de compilación está en el [README](README.md#documento-de-tesis).
