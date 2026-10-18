# Architecture

Cómo está organizado el backend: capas, pipeline de extracción y componentes del core. Este archivo es el punto de entrada técnico. El detalle de cada tema vive en su propio archivo y aquí solo se enlaza. El porqué de las decisiones está en la tesis (`docs/tesis/tesis.tex`).

## Stack

- Node.js en la versión LTS fijada en `.nvmrc`, TypeScript y Express.
- MongoDB con Mongoose como capa de persistencia.
- zod para validar la configuración de cada indicador (`IndicatorBuilder`) y las variables de entorno (`src/config/environment.config.ts`).
- cheerio, `request-promise`, `fetch` nativo y Puppeteer para obtener y leer las fuentes.
- node-cron para programar la ejecución, pino para el log y Jest para los tests.

Las versiones exactas están en `package.json`. Los scripts npm también.

## Carpetas principales de `src/`

| Carpeta | Qué contiene |
|---|---|
| `src/app.ts` | Punto de arranque: registra los scrapers en `ScraperFactory`, levanta el servidor, conecta MongoDB e inicia `CronRegistry`. |
| `src/api/` | Servidor Express (`server.ts`), rutas por módulo (`routes/`) y traducción de errores a HTTP (`error-handler.ts`). |
| `src/core/` | Motor genérico: `ScrapeBase`, `ScraperFactory`, `IndicatorBuilder`, `CronRegistry`, los adapters base (`adapters/`), las frecuencias (`enums/`), la jerarquía de errores (`errors/`) y el logger (`logger/`). |
| `src/modules/` | Un directorio por fuente de datos, con la configuración de sus indicadores y los adapters concretos. |
| `src/config/` | Variables de entorno (`environment.config.ts`) y conexión a MongoDB (`database.config.ts`). |

## Las tres capas

```
API (src/api)  →  core (src/core)  ←  módulos (src/modules)
```

- **API.** Recibe el request HTTP, busca el scraper en `ScraperFactory` y delega. No conoce fetch, parse ni storage.
- **Core.** Define el contrato de cada paso del pipeline (los adapters abstractos) y ejecuta el pipeline (`ScrapeBase.init`). No conoce ninguna fuente concreta.
- **Módulos.** Implementan los adapters para una fuente concreta y declaran sus indicadores en un `config.ts`. Dependen del core. El core nunca importa de un módulo.

Las rutas tampoco conocen los adapters: usan solo la interfaz pública de `ScrapeBase` (`init`, `findStoredRecords`, `getCalculatorAdapter`, `getIndicators`, `getIndicatorUrl` y sus pares). Por eso agregar una fuente no toca el core.

## Pipeline de `ScrapeBase.init`

`ScrapeBase.init(indicator, params)` ejecuta los pasos en este orden:

1. **URL.** Reemplaza los `{{param}}` de la URL del indicador con `params`.
2. **Fetch.** `FetchAdapter.fetch(url)` devuelve el contenido crudo como `string`.
3. **Parse.** `ParseAdapter.extract` lo convierte en una lista de objetos. Si la lista viene vacía lanza `ParseError` y el pipeline se detiene sin guardar nada.
4. **Mapper.** `MapperAdapter.map` normaliza cada objeto (tipos, nombres, fechas).
5. **Contexto y hash.** Agrega `params`, `indicator` y `module` a cada registro (los datos de la fuente ganan si un campo coincide con un param) y le asigna `key` con `HashAdapter.generate`.
6. **Storage.** `StorageAdapter.save` guarda la lista completa. Los duplicados se ignoran por la `key` (ver [context/modules.md](./context/modules.md)).
7. **Calculator (opcional).** Si el indicador define un `CalculatorAdapter`, calcula un resultado agregado con los registros de esta ejecución y lo guarda.

`init` devuelve la lista de registros procesados en esa ejecución, existan o no ya en la base.

## Componentes del core

| Componente | Archivo | Responsabilidad |
|---|---|---|
| `ScrapeBase` | `src/core/ScrapeBase.ts` | Clase abstracta. Guarda el nombre del módulo y su configuración, expone los datos de cada indicador y ejecuta el pipeline. Cada módulo la extiende. |
| `ScraperFactory` | `src/core/ScraperFactory.ts` | Registro de scrapers por nombre de módulo. Es un singleton (`getInstance`). Lanza `ScraperAlreadyRegisteredError` si se registra dos veces el mismo nombre y `ScraperNotFoundError` si se pide uno que no existe. |
| `IndicatorBuilder` | `src/core/IndicatorBuilder.ts` | Builder con un `set*` por campo del indicador. `build()` valida los campos de datos con zod (nombre, URL, frecuencia, descripción y metadata) y devuelve el indicador. Una frecuencia vacía o una expresión cron inválida se valida ahí. Los adapters se asignan sin validación en runtime. |
| `CronRegistry` | `src/core/CronRegistry.ts` | Singleton que programa con node-cron cada indicador cuya frecuencia no sea vacía. En cada ejecución llama a `init` con los params que resuelve `setScheduledParams`. Si una ejecución programada falla, la captura, la registra como `CronExecutionError` en el log y sigue con las demás. |
| `FREQUENCIES` | `src/core/enums/Frequencies.ts` | Enum con las expresiones cron disponibles. `FREQUENCIES.once` es la cadena vacía: el indicador no se programa y solo se ejecuta al llamar su endpoint `POST`. |
| Logger | `src/core/logger/` | Instancia única de pino. Escribe en `logs/` y, en `dev`, también en consola con formato legible. El nivel depende de `NODE_ENV`. |

La frecuencia de cada indicador, su URL y sus adapters están en el `config.ts` de su módulo, no en estos componentes.

## Patrones usados

| Patrón | Dónde | Para qué |
|---|---|---|
| Builder | `IndicatorBuilder` | Armar la configuración de un indicador paso a paso y validarla una sola vez al construirla. |
| Adapter | `src/core/adapters/*` | Un contrato por paso del pipeline, con una implementación por fuente. Cambiar una fuente es cambiar el adapter, no el pipeline. |
| Factory y Singleton | `ScraperFactory`, `CronRegistry` | Un único registro de scrapers y un único planificador compartidos por la API y el cron. |
| Clase abstracta | `ScrapeBase` y los adapters base | Fijar el algoritmo (`init`) y dejar variable lo que cambia entre fuentes. |

Para el porqué de estas decisiones y las alternativas descartadas, ver la sección *Patrones de diseño* de la tesis.

## Flujo de un request

Ejemplo con `POST /<modulo>/:indicator`:

1. `src/api/routes/index.ts` monta cada router bajo el nombre de su módulo. El router correspondiente recibe el request.
2. La ruta obtiene el scraper con `ScraperFactory.getInstance().get(MODULE)` y verifica que el indicador exista. Si no existe responde 404.
3. Llama a `scraper.init(indicator, params)`. Los `params` salen del query string solo si el módulo lo necesita.
4. `init` corre el pipeline descrito arriba y la ruta responde con los registros procesados.
5. Cualquier error que lance el pipeline llega a `errorHandler`, que lo traduce a una respuesta HTTP (ver [context/errors.md](./context/errors.md)).

Las lecturas (`GET`) no pasan por el pipeline: la ruta pide los registros guardados con `scraper.findStoredRecords` o el último resultado calculado con `calculator.find`.

El mismo `init` lo llama `CronRegistry` en cada ejecución programada, con los params que resuelve `setScheduledParams` del indicador (`{}` si no lo declara).

## Nombre del módulo en la API

El nombre con el que un módulo se registra y aparece en la URL sale del primer argumento de `super("<nombre>", ...)` en la clase del módulo, no del nombre de su carpeta. No siempre coinciden: la carpeta `src/modules/emergencias-desastres/` registra el módulo `emergencia-desastres`. La constante `MODULE` de su archivo de rutas debe usar ese mismo nombre.

Índice completo de la documentación: [README](./README.md).
