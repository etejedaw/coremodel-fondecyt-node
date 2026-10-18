# Documentación técnica en docs/

**Released:** 2026-10-18

## Summary

La documentación técnica sale del README y se reparte en archivos temáticos dentro de `docs/`, con `docs/README.md` como índice. La regla que ordena la carpeta es "un dato, un archivo": cada tema tiene un único dueño y el resto enlaza, de modo que un cambio se hace en un solo lugar. El README queda para la primera instalación y el `CLAUDE.md`, para las reglas del agente y los enlaces a `docs/`. Una segunda pasada quita lo que se repetía entre archivos o copiaba valores que viven en el código.

## Highlights

- Índice `docs/README.md` con una tabla de qué leer según la tarea y las reglas para mantener la carpeta.
- Documentos de referencia: `architecture.md` y `context/` (`modules`, `data`, `errors`, `infrastructure` y `conventions`).
- README y `CLAUDE.md` reducidos a lo esencial, con enlaces a `docs/`.

## Added

- `docs/architecture.md`: stack, capas, pipeline ETL y componentes del core.
- `docs/context/modules.md`: anatomía de módulos e indicadores, contrato de cada adapter y pasos para agregar indicadores y módulos.
- `docs/context/data.md`: fuentes, colecciones de MongoDB, `indicator-results` y normalización de regiones.
- `docs/context/errors.md`: jerarquía de errores y su traducción a HTTP.
- `docs/context/infrastructure.md`: servicios de Docker Compose, init de Mongo, aprovisionamiento de Metabase y variables de entorno.
- `docs/context/conventions.md`: convenciones de código, tests, git y commits.
- `docs/README.md`: índice, tabla de dueños por tipo de información, reglas de escritura y relación con la tesis.

## Changed

- El README pasa a cubrir solo la instalación, los scripts y la compilación de la tesis. Lo demás se enlaza a `docs/`.
- `CLAUDE.md` se reduce a las reglas del agente, la configuración de skills y los enlaces a `docs/`.
- El índice une las tablas de tareas y de archivos en una sola, y `architecture.md` deja de repetirlo.
- `modules.md` agrega el paso de registrar colecciones nuevas en `.docker/mongo/init.js` y quita notas repetidas.
- `data.md` enlaza la regla de historial de `indicator-results` a `modules.md`.
- `conventions.md`, `errors.md` e `infrastructure.md` quitan reglas de estilo, mensajes de 404 y detalles del logger que ya cubrían el código o la colección Bruno.

## Files of interest

- `docs/README.md`
- `docs/architecture.md`
- `docs/context/`
- `README.md`
- `CLAUDE.md`

## Commits

- `d7ad3f7` — docs: add architecture, modules and data references
- `9412f9a` — docs: add errors context document
- `49a06e1` — docs: add infrastructure context document
- `c98e1d0` — docs: add conventions context document
- `9f80e37` — docs: add docs index with task guide and maintenance rules
- `91ff39b` — docs(readme): slim down to first-time setup and link to docs
- `aa4fcbb` — docs: reduce claude instructions to agent rules and docs links
- `80a5eff` — docs: remove redundant index section from architecture
- `6fc9714` — docs: merge task and file tables in docs index
- `36442be` — docs: remove redundant notes and add mongo init step in modules guide
- `836845c` — docs: link indicator-results history rule to modules guide
- `890a8b5` — docs: remove redundant style, naming and test rules from conventions
- `1739176` — docs: drop 404 messages and logger details from errors
- `e5878e4` — docs: trim logger and empty database notes from infrastructure
