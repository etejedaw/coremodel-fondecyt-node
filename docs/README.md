# Documentación

Índice de `docs/`. Para instalar y ejecutar el proyecto, ver el [README](../README.md) de la raíz.

## Qué leer según la tarea

| Quiero... | Leer |
|---|---|
| Entender el proyecto | [`architecture.md`](./architecture.md) |
| Agregar un indicador | [`context/modules.md`](./context/modules.md) |
| Agregar un módulo | [`context/modules.md`](./context/modules.md) y [`architecture.md`](./architecture.md) |
| Tocar el manejo de errores | [`context/errors.md`](./context/errors.md) |
| Tocar Docker, Mongo o Metabase | [`context/infrastructure.md`](./context/infrastructure.md) |
| Saber de dónde salen los datos y cómo se guardan | [`context/data.md`](./context/data.md) |
| Revisar convenciones de código, tests y commits | [`context/conventions.md`](./context/conventions.md) |
| Consultar o cambiar endpoints | [`api/`](./api/) |
| Ver el historial de cambios | [`changelogs/`](./changelogs/) |
| Entender el porqué de las decisiones | [`tesis/`](./tesis/) |

## Archivos

| Archivo | Qué cubre |
|---|---|
| [`architecture.md`](./architecture.md) | Capas (API, core, módulos), pipeline ETL, componentes del core y patrones usados |
| [`context/modules.md`](./context/modules.md) | Anatomía de módulo e indicador, contrato de cada adapter, fetch adapters disponibles, deduplicación por hash y pasos para agregar indicadores y módulos |
| [`context/data.md`](./context/data.md) | Fuentes (Mineduc vía Wayback Machine, BCN), colecciones de MongoDB, `indicator-results` y normalización de regiones |
| [`context/errors.md`](./context/errors.md) | Jerarquía de errores y su traducción a HTTP |
| [`context/infrastructure.md`](./context/infrastructure.md) | Servicios de Docker Compose, init de Mongo y aprovisionamiento de Metabase |
| [`context/conventions.md`](./context/conventions.md) | Estilo, nombres, tests, git y commits |
| [`api/`](./api/) | Colección Bruno: única fuente de los endpoints |
| [`changelogs/`](./changelogs/) | Un archivo por feature entregada, con contexto y commits, generado con la skill `release-changelog` |
| [`tesis/`](./tesis/) | Documento de tesis en LaTeX y su PDF |

## Reglas para mantener esta carpeta

### Un dato, un archivo

Cada dato vive en un solo archivo. Los demás enlazan, no copian: así un cambio se hace en un lugar y no quedan copias desfasadas.

| Información | Dueño |
|---|---|
| Endpoints, params, respuestas y errores por endpoint | `api/` |
| Mapeo de errores a HTTP | `context/errors.md` |
| Capas, pipeline y componentes del core | `architecture.md` |
| Crear módulos e indicadores, adapters, duplicados | `context/modules.md` |
| Fuentes, colecciones y normalización | `context/data.md` |
| Docker, Mongo init y Metabase | `context/infrastructure.md` |
| Convenciones de código y git | `context/conventions.md` |
| Instalación, scripts npm y compilación de la tesis | `README.md` |
| Configuración de skills y reglas del agente | `CLAUDE.md` |
| Versiones, nombres de colecciones, frecuencias y credenciales | El código (`package.json`, `.nvmrc`, `schema.ts`, `config.ts`, `.docker/`) |
| El porqué de las decisiones, revisión bibliográfica, viabilidad y resultados | La tesis |

### Cómo escribir

- `docs/` describe cómo funciona el código hoy; la tesis cuenta por qué. Para el porqué, enlaza a la sección de `tesis/tesis.tex`.
- No copies valores que viven en el código: nombra el archivo donde están.
- Sin árboles completos de carpetas; como mucho una tabla con las carpetas principales.
- Markdown sin hard-wrap: cada párrafo, ítem y celda en una sola línea.
- Enlaces relativos entre archivos.

### La tesis

La tesis es una foto del sistema al entregarla y no puede enlazar a `docs/`, así que repite parte del contenido. Si un cambio de código toca algo que la tesis describe (endpoints, módulos, cantidad de tests, flujo), se actualiza la tesis en el mismo ciclo y se recompila el PDF.
