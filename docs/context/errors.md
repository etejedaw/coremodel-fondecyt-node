# Errores

Cómo se modelan los errores, quién los lanza y cómo llegan al cliente HTTP. Los mensajes exactos de cada endpoint están en la colección Bruno de [`docs/api/`](../api/): este documento no los repite.

## Jerarquía

Todo vive en `src/core/errors/` y se exporta desde `src/core/errors/index.ts`.

| Clase | Archivo | Qué representa | HTTP |
|---|---|---|---|
| `BaseError` | `BaseError.ts` | Clase abstracta. Guarda `message`, `name` (el nombre de la clase) y un `context` opcional (`Record<string, unknown>`) | — |
| `DomainError` | `DomainError.ts` | El pedido o la configuración no son válidos. El problema está de nuestro lado de la frontera: query inválida, fuente sin datos extraíbles, módulo no registrado | 400 |
| `ServiceError` | `ServiceError.ts` | Falla un servicio externo: la fuente de datos o MongoDB | 502 |
| Cualquier otro `Error` | — | Bug o fallo inesperado | 500 |

La separación existe para que el error handler decida el código HTTP con un `instanceof` sobre dos clases, sin conocer los errores concretos.

El `context` no viaja al cliente. Sirve solo para el log: el error handler lo escribe junto al mensaje.

## Errores concretos

| Error | Padre | Mensaje | Contexto | Quién lo lanza |
|---|---|---|---|---|
| `InvalidQueryParamError` | `DomainError` | `<param> query param <motivo>` | `param`, `value` | `parseYear` en `src/api/routes/biblioteca-congreso-nacional.route.ts` |
| `ParseError` | `DomainError` | `Cannot extract data from source` | `indicator`, `url` | `ScrapeBase.init` cuando el `ParseAdapter` devuelve una lista vacía |
| `ScraperNotFoundError` | `DomainError` | `Scraper <módulo> not found` | `module` | `ScraperFactory.get` |
| `ScraperAlreadyRegisteredError` | `DomainError` | `Scraper <módulo> is already registered` | `module` | `ScraperFactory.register` |
| `AdapterNotFoundError` | `DomainError` | `<tipo> not found` | `adapterType`, `indicator` | Nadie hoy: está declarado y exportado, pero ningún código lo lanza |
| `FetchError` | `ServiceError` | `Fetch failed for <url>` | `url`, `cause` | Los fetch adapters de `src/core/adapters/fetch-adapter/` |
| `StorageError` | `ServiceError` | `Storage failed: <detalle>` | el que pase quien lo lanza | Los `storage-adapter.ts` de cada módulo, en `find` e `insertMany` |
| `CronExecutionError` | `ServiceError` | `Cron execution failed for <indicador>` | `indicator`, `cause` | `CronRegistry.start`, solo para registrar el fallo (ver [Errores en el cron](#errores-en-el-cron)) |

Detalles que conviene saber:

- `FetchError` guarda el mensaje de la causa en `context.cause`, no en `message`. Por eso el cliente ve `Fetch failed for <url>` sin el detalle técnico.
- Los fetch adapters usan los helpers de `src/core/adapters/fetch-adapter/fetch-errors.ts`. `toFetchError(url, error)` envuelve cualquier error en un `FetchError` y deja pasar uno que ya lo sea. `assertResponseOk(url, response)` lanza `FetchError` con `HTTP <status>` cuando la respuesta no es 2xx. `PuppeteerAdapter` hace la misma comprobación con el estado de la navegación.
- Los errores de clave duplicada de MongoDB no son `StorageError`: los `storage-adapter.ts` los detectan, los registran con `logger.warn` y siguen. Es el mecanismo de deduplicación descrito en [modules.md](./modules.md).
- El `CalculatorAdapter` no envuelve sus errores de MongoDB: si falla `save` o `find`, el error llega crudo y el cliente recibe 500.
- Un `ZodError` de `IndicatorBuilder.build()` (URL inválida, cron inválido) se lanza al importar el `config.ts` del módulo, antes de que el servidor atienda requests. Tumba el arranque, no se traduce a HTTP.

## Traducción a HTTP

`src/api/error-handler.ts` es el último middleware de Express, registrado en `src/api/server.ts` después del router. Cada ruta envuelve su lógica en `try/catch` y delega con `next(err)`.

1. Si el error es un `BaseError`, escribe `logger.error({ context }, message)`. Si no, `logger.error(err)`.
2. `DomainError` responde 400 con `{ "error": err.message }`.
3. `ServiceError` responde 502 con `{ "error": err.message }`.
4. Cualquier otro responde 500 con `{ "error": "Internal server error" }`. El mensaje original nunca sale al cliente, para no filtrar detalles internos.

Todas las respuestas de error tienen la forma `{ "error": "<mensaje>" }`.

`ScraperNotFoundError` mapea a 400, pero las rutas pasan un nombre de módulo fijo y registrado en `src/app.ts`, así que hoy no se alcanza desde HTTP.

## De dónde sale el 404

El 404 no es una clase de error. Lo responde directamente cada ruta en `src/api/routes/<modulo>.route.ts`, con el mismo formato `{ "error": "<mensaje>" }`, sin pasar por el error handler:

| Caso | Rutas |
|---|---|
| El indicador no está en `scraper.getIndicators()` | `GET` y `POST` de `/:indicator` en ambos módulos, y `GET /:indicator/result` |
| El indicador no define `CalculatorAdapter` | `GET /:indicator/result` |
| Hay calculator pero todavía no hay resultado guardado | `GET /:indicator/result` |

Hoy solo el módulo `emergencia-desastres` expone `/result`, porque es el único con calculator. Los endpoints y sus respuestas completas están en [`docs/api/`](../api/).

## Errores en el cron

Los trabajos del `CronRegistry` no tienen request, así que no hay error handler ni código HTTP. Cada ejecución llama a `scraper.init(indicator)` dentro de un `try/catch`. Si falla, construye un `CronExecutionError` con la causa, lo registra con `logger.error({ context }, message)` y termina sin relanzar. La tarea sigue programada y se reintenta en la próxima ocurrencia de su expresión cron.

El `CronExecutionError` se instancia solo para dar forma al log (mensaje y contexto consistentes); nunca se lanza.

Los errores quedan en `logs/errors.log` (desde `warn`). El resto del logger está en [architecture.md](../architecture.md#componentes-del-core).

## Agregar un error nuevo

1. Decide el padre según a quién se le atribuye el fallo. Si el cliente o la configuración causaron el problema, `DomainError` (400). Si falló algo externo, `ServiceError` (502). Un tercer código HTTP requiere tocar `error-handler.ts`.
2. Crea la clase en `DomainError.ts` o `ServiceError.ts`. El constructor arma el mensaje y pasa un `context` con los datos para depurar, como las clases existentes.
3. Expórtala desde `src/core/errors/index.ts`.
4. Lánzala donde ocurra el fallo. Las rutas ya delegan con `next(err)`, no hace falta tocar el handler.
5. Agrega el caso a `test/api/error-handler.test.ts` si cambia el mapeo, y un test del lugar que la lanza.
6. Documenta el mensaje exacto en la sección `Errors` del `.yml` de Bruno de cada endpoint afectado, con la skill `bruno-endpoints` (ver [conventions.md](./conventions.md)).
