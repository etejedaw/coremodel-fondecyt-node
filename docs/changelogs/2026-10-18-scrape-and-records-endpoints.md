# Extracción por POST, lectura de registros y mapeo de errores a HTTP

**Released:** 2026-10-18

## Summary

La API separa la extracción de la lectura. `POST /:indicator` consulta la fuente, guarda en MongoDB y recalcula el resultado. `GET /:indicator` solo lee los registros guardados, así que consultar un indicador ya no vuelve a golpear la fuente. Junto con esto, el manejador de errores traduce cada familia a un código HTTP: `DomainError` a 400, `ServiceError` a 502 y el resto a 500. Para que las fallas de red lleguen como 502, los fetch adapters envuelven cualquier error en `FetchError`. La colección Bruno, el README y la tesis se actualizan con los métodos, las respuestas y los errores.

## Highlights

- `POST /emergencia-desastres/:indicator` y `POST /biblioteca-congreso-nacional/:indicator` ejecutan la extracción.
- `GET /:indicator` lee de MongoDB los registros del indicador, sin `_id` ni `__v`.
- Errores mapeados a 400, 502 y 500 con cuerpo `{ "error": "<mensaje>" }`.
- `year` validado en la BCN: obligatorio y de 4 dígitos cuando la URL del indicador usa `{{year}}`.

## Added

- `InvalidQueryParamError` en `src/core/errors/DomainError.ts`, con los mensajes `year query param is required` y `year query param must be a 4-digit year`.
- `src/core/adapters/fetch-adapter/fetch-errors.ts`, con `toFetchError` y `assertResponseOk`. Este último convierte una respuesta no `ok` en `FetchError` con `HTTP <status>`.
- `ScrapeBase.findStoredRecords(indicator)`, que delega en el `StorageAdapter` del indicador.
- Endpoints `POST /:indicator` en `emergencia-desastres.route.ts` y `biblioteca-congreso-nacional.route.ts`.
- En la colección Bruno, los requests `extraer-*` para cada indicador y la documentación de `resumen-modulos` y de los simulacros. Cada request lleva H1, `**Auth:** public`, `Response 200` y `Errors`.
- Tests del manejador de errores, de los cuatro fetch adapters, de `ScrapeBase` y de las rutas de ambos módulos, con el helper `test/api/helpers/test-server.ts`.

## Changed

- `GET /:indicator` deja de ejecutar la extracción y responde `{ "data": [...] }` con lo almacenado, o `{ "data": [] }` si aún no hay registros.
- `StorageAdapter.find` recibe el indicador, filtra por él y devuelve `Array<Record<string, unknown>>`. Los storage adapters de `organizaciones-comunitarias`, `tasa-pobreza-ingresos` y `emergencias-desastres` lo implementan y envuelven las fallas en `StorageError`.
- `errorHandler` registra en el log todo error, sea `BaseError` o no, antes de responder.
- `FetchError` acepta una causa de cualquier tipo y guarda su `message` cuando es un `Error`.
- `DownloadAdapter`, `JsonFetchAdapter`, `PuppeteerAdapter` y `RequestPromiseAdapter` convierten cualquier falla en `FetchError`.
- El README documenta los nuevos métodos y la tabla de códigos de error.
- En la tesis se actualizan la tabla de endpoints, la descripción de la API, la figura de registros de simulacros y el conteo de pruebas (90 en 24 archivos). El PDF se recompila.

## Migration

- Para extraer, cambiar `GET` por `POST` en el mismo path, por ejemplo `curl -X POST localhost:3000/emergencia-desastres/simulacros-2021`.
- Los clientes que trataban cualquier `BaseError` como 400 deben esperar 502 cuando falla la fuente o MongoDB.

## Files of interest

- `src/api/error-handler.ts`
- `src/api/routes/biblioteca-congreso-nacional.route.ts`
- `src/api/routes/emergencia-desastres.route.ts`
- `src/core/adapters/fetch-adapter/fetch-errors.ts`
- `src/core/adapters/storage-adapter/StorageAdapter.ts`
- `docs/api/`

## Commits

- `8f96f89` — docs(api): document responses, errors and auth in bruno collection
- `b4eff39` — feat(errors): map domain, service and unexpected errors to 400, 502 and 500
- `ac89955` — fix(fetch): wrap fetch adapter failures in FetchError
- `5881d80` — feat(storage): read stored records by indicator
- `dc1921b` — feat(api): scrape indicators via post and read stored records via get
- `17f6481` — docs(api): document post scrape and get stored records endpoints
- `79ae553` — docs(readme): document post scrape endpoints and error codes
- `c04a007` — docs(thesis): sync api endpoints and test counts with code
- `0624ae1` — docs(thesis): rebuild pdf
- `ac9f5b5` — fix(thesis): use jest test count in testing section
- `20a5935` — docs(thesis): rebuild pdf
