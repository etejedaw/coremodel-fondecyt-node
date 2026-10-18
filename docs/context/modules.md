# Módulos e indicadores

Cómo se compone un módulo, qué exige cada adapter del core y cómo agregar un indicador o un módulo nuevo. La vista general del pipeline está en [../architecture.md](../architecture.md).

## Anatomía de un módulo

Un módulo vive en `src/modules/<modulo>/` y agrupa los indicadores de una misma fuente.

| Archivo | Rol |
|---|---|
| `config.ts` | Exporta un `ModuleConfig`: un objeto cuya clave es el identificador del indicador (el que va en la URL) y cuyo valor sale de `IndicatorBuilder`. Es el único lugar donde se declaran URL, frecuencia y adapters. |
| `index.ts` | Clase que extiende `ScrapeBase` y llama a `super("<nombre>", CONFIG)`. El nombre es el que se registra en `ScraperFactory` y el que aparece en la API. |

La clave del `ModuleConfig` es lo que `ScrapeBase.getIndicators()` devuelve y lo que las rutas reciben como `:indicator`. El campo `name` del builder es solo el nombre legible que muestra el resumen de módulos.

## Anatomía de un indicador

Cada indicador necesita una implementación de cada adapter, salvo el calculator, que es opcional.

| Archivo | Contenido |
|---|---|
| `parse-adapter.ts` | Implementa `ParseAdapter`. Conoce la estructura de la fuente. |
| `mapper.ts` | Implementa `MapperAdapter`. Convierte tipos y nombres. |
| `hash.ts` | Implementa `HashAdapter`. Define qué hace único a un registro. |
| `storage-adapter.ts` | Extiende `StorageAdapter`. Guarda y lee en MongoDB. |
| `schema.ts` | Modelo Mongoose de la colección. Declara `key` como único. |
| `interfaces.ts` | Tipos `Input` (lo que entrega el parse) y `Output` (lo que entrega el mapper). |
| `calculator-adapter.ts` | Opcional. Extiende `CalculatorAdapter` y guarda un resultado agregado. |

El fetch adapter no se escribe por indicador: se reutiliza uno del core (ver más abajo).

## Un indicador o varios

La estructura de carpetas depende de cuántos indicadores tenga el módulo.

- **Un tipo de dato, archivos en la raíz.** `emergencias-desastres` tiene tres indicadores (`simulacros-2021`, `simulacros-2022`, `simulacros-2023`) que comparten la misma estructura de página. Por eso hay un solo juego de adapters en la raíz del módulo y el `config.ts` los instancia tres veces, cambiando solo la URL.
- **Varios tipos de dato, una subcarpeta por tipo.** `biblioteca-congreso-nacional` tiene dos fuentes con formatos distintos (una tabla HTML y un JSON). Cada una tiene su subcarpeta (`tasa-pobreza-ingresos/`, `organizaciones-comunitarias/`) con su propio juego de adapters, schema e interfaces, y un `index.ts` que reexporta mapper, parse, schema y storage. Los hash adapters se importan directo desde su archivo en el `config.ts`.

La regla es que la carpeta agrupa indicadores que comparten adapters. Si dos indicadores necesitan un parse distinto, van en carpetas distintas.

## Contrato de los adapters base

Los contratos están en `src/core/adapters/`. Todos son clases abstractas que el módulo implementa.

| Adapter | Recibe | Devuelve | Error |
|---|---|---|---|
| `FetchAdapter.fetch(url)` | La URL ya con los `{{param}}` reemplazados. | `Promise<string>` con el contenido crudo. | `FetchError` si falla la red o la respuesta no es OK. |
| `ParseAdapter.extract(data)` | El `string` del fetch. | Una lista de objetos (`Input[]`). | No lanza uno propio: si devuelve una lista vacía, `ScrapeBase` lanza `ParseError`. |
| `MapperAdapter.map(item)` | Un elemento de la lista del parse. | El objeto normalizado (`Output`). | Ninguno definido por el contrato. |
| `HashAdapter.generate(data)` | El registro mapeado más `indicator` y `module`. | `string` que se usa como `key`. | Ninguno definido por el contrato. |
| `StorageAdapter.save(data)` | La lista completa de registros con `key`. | `Promise<void>`. | `StorageError` si falla la escritura. Los duplicados no son error. |
| `StorageAdapter.find(indicator)` | El identificador del indicador. | Los registros guardados de ese indicador, sin `_id` ni `__v`. | `StorageError` si falla la lectura. |
| `CalculatorAdapter.calculate(data)` | Los registros de la ejecución actual. | El resultado agregado. | Ninguno definido por el contrato. |
| `CalculatorAdapter.save(result, indicator, module)` | El resultado y a quién pertenece. | `Promise<void>`. | Lo que lance Mongoose. |
| `CalculatorAdapter.find(indicator, module)` | Indicador y módulo. | El último resultado, o `null` si no hay. | Lo que lance Mongoose. |

Los errores y su traducción a HTTP están en [errors.md](./errors.md).

Dos detalles del contrato que conviene tener presentes:

- `ParseAdapter.extract` y `FetchAdapter.fetch` son propiedades abstractas, no métodos. En la práctica las implementaciones los escriben como métodos de clase.
- El calculator recibe los registros que acaba de procesar la ejecución, no lo que hay en la base. Si una ejecución trae menos registros que la anterior, el resultado calculado refleja solo esa ejecución.

## Fetch adapters disponibles

Están en `src/core/adapters/fetch-adapter/`. Un módulo elige uno con `setFetchAdapter`.

| Adapter | Qué hace | Quién lo usa |
|---|---|---|
| `RequestPromiseAdapter` | GET con `request-promise`. Devuelve el cuerpo tal cual (HTML). | `emergencias-desastres` y `tasa-pobreza-ingresos` de la BCN. |
| `JsonFetchAdapter` | GET con `fetch`, valida que la respuesta sea OK, la lee como JSON y la devuelve serializada como `string`. | `organizaciones-comunitarias` de la BCN. |
| `PuppeteerAdapter` | Abre un navegador headless, navega a la URL y devuelve el HTML ya renderizado. Cierra el navegador siempre. | Ningún módulo hoy. Disponible para páginas que dependen de JavaScript. |
| `DownloadAdapter` | Descarga el archivo a `/tmp/<nombre>` y devuelve la ruta, no el contenido. | Ningún módulo hoy. El parse adapter que lo use debe leer el archivo desde esa ruta. |

## Parámetros `{{param}}` en la URL

La URL de un indicador puede tener marcadores `{{nombre}}`. `ScrapeBase.init` recibe un objeto `params` y reemplaza cada `{{clave}}` por su valor antes de llamar al fetch.

El caso en uso es `valdivia-tasa-pobreza-ingresos`, cuya URL tiene `{{year}}`. Quien llama a `init` es responsable de pasar los params: la ruta de ese módulo (`biblioteca-congreso-nacional.route.ts`) detecta si la URL contiene `{{year}}`, exige el query param `year` con cuatro dígitos y lo pasa. Para la ejecución programada, el indicador declara `setScheduledParams(resolver)` en el `IndicatorBuilder`: `resolver` es una función sin argumentos que devuelve `Record<string, string>` y se evalúa en cada ejecución del cron, no al construir. `CronRegistry` pasa ese resultado a `init` (`ScrapeBase.getIndicatorScheduledParams`, que devuelve `{}` si no hay resolver). `valdivia-tasa-pobreza-ingresos` resuelve `year` con el año actual. Los params también se agregan a cada registro antes del hash; si la fuente trae un campo con el mismo nombre, gana el dato de la fuente.

## Deduplicación

Ejecutar un indicador dos veces no debe duplicar registros. El mecanismo tiene tres piezas:

1. **Hash.** El `HashAdapter` del indicador calcula una `key` a partir de los campos que identifican al registro. Qué campos entran en la `key` es una decisión de cada módulo y está en su `hash.ts`.
2. **Campo único.** El `schema.ts` declara `key` con `unique: true`, así que MongoDB rechaza una segunda inserción con la misma clave.
3. **Duplicado ignorado.** El `StorageAdapter` inserta con `insertMany(data, { ordered: false })`, que sigue con el resto aunque haya claves repetidas, y captura el error de duplicados: lo registra con `logger.warn` y retorna sin lanzar nada.

Consecuencia: una clave que ya existe nunca se actualiza. Si la fuente corrige un valor, el registro guardado queda con el valor antiguo. Por eso importa qué entra en el hash:

- `emergencias-desastres`: fecha y región. Dos simulacros el mismo día en la misma región se consideran el mismo registro.
- `tasa-pobreza-ingresos`: unidad territorial, año, módulo e indicador.
- `organizaciones-comunitarias`: año, indicador y módulo, comprimidos en un identificador corto.

El storage de `emergencias-desastres` captura cualquier `MongoBulkWriteError`, no solo los de clave duplicada. Los de la BCN capturan solo el código 11000.

### Resultados del calculator

El calculator tiene su propia deduplicación, sin hash. `save` busca el último resultado guardado para ese par indicador y módulo, lo compara con el nuevo y solo inserta si cambió. Si es igual, lo registra en el log y no escribe. Así la colección conserva el historial de cambios sin repetir resultados idénticos. La colección y su uso están en [data.md](./data.md).

## Agregar un indicador a un módulo existente

1. Si el indicador comparte estructura con los que ya existen, reutiliza sus adapters. Si no, crea su subcarpeta con `parse-adapter.ts`, `mapper.ts`, `hash.ts`, `storage-adapter.ts`, `schema.ts` e `interfaces.ts` (y `calculator-adapter.ts` si necesita un resultado agregado).
2. Declara el indicador en el `config.ts` del módulo con `IndicatorBuilder`: nombre, URL, frecuencia (de `FREQUENCIES`), los cinco adapters obligatorios y el calculator si corresponde. Llama a `build()` al final.
3. Si el indicador usa una colección nueva, agrégala a `.docker/mongo/init.js` (ver [infrastructure.md](./infrastructure.md#inicialización-de-mongodb)).
4. Si la URL usa `{{param}}`, haz que la ruta del módulo pase ese param y, si el indicador tiene frecuencia, declara `setScheduledParams` para que el cron también lo pase.
5. Documenta el endpoint en la colección Bruno de `docs/api/` con la skill `bruno-endpoints`.
6. Agrega los tests en `test/`, reflejando la estructura de `src/`: parse, mapper, hash, storage, y un `etl.test.ts` del flujo completo.

## Agregar un módulo nuevo

1. Crea `src/modules/<modulo>/` con `config.ts` e `index.ts` (ver las dos primeras secciones) y los adapters de sus indicadores.
2. En `index.ts`, la clase extiende `ScrapeBase` y fija el nombre del módulo en `super("<nombre>", CONFIG)`.
3. Registra el scraper en `src/app.ts` con `scraperFactory.register(new MiScraper())`, antes de que se inicie `CronRegistry`.
4. Crea la ruta en `src/api/routes/<modulo>.route.ts`, con `MODULE` igual al nombre del `super(...)`, y móntala en `src/api/routes/index.ts`.
5. Documenta los endpoints en `docs/api/` con la skill `bruno-endpoints`.
6. Agrega los tests en `test/modules/<modulo>/` y, si hay ruta, en `test/api/routes/`.
