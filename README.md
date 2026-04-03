# Software de extracción de datos para proyecto FONDECYT

Resiliencia comunitaria ante tsunami en la costa chilena: Modelando escenarios multidimensionales con una aproximación participativa.

Automatización de extracción, normalización y consulta de indicadores sociales desde diversas fuentes abiertas, basado en una arquitectura modular, extensible y documentada.

## Para ejecutar en local:

1. Levantar la base de datos

```bash
docker compose up
```

2. Levantar proyecto en modo desarrollo

```bash
npm run dev
```

## Estructura del proyecto

```
src
├── api
│   ├── server.ts
│   └── routes
│       ├── index.ts
│       ├── emergencia-desastres.route.ts
│       └── biblioteca-congreso-nacional.route.ts
├── config
│   ├── database.config.ts
│   └── environment.config.ts
├── core
│   ├── adapters
│   │   ├── fetch-adapter
│   │   │   ├── FetchAdapter.ts
│   │   │   ├── RequestPromiseAdapter.ts
│   │   │   ├── JsonFetchAdapter.ts
│   │   │   ├── PuppeteerAdapter.ts
│   │   │   └── DownloadAdapter.ts
│   │   ├── parse-adapter/ParseAdapter.ts
│   │   ├── mapper-adapter/MapperAdapter.ts
│   │   ├── hash-adapter/HashAdapter.ts
│   │   ├── storage-adapter/StorageAdapter.ts
│   │   └── calculator-adapter/CalculatorAdapter.ts
│   ├── enums/Frequencies.ts
│   ├── errors
│   │   ├── BaseError.ts
│   │   ├── DomainError.ts
│   │   └── ServiceError.ts
│   ├── logger/Logger.ts
│   ├── CronRegistry.ts
│   ├── IndicatorBuilder.ts
│   ├── ScrapeBase.ts
│   └── ScraperFactory.ts
└── modules
    ├── emergencias-desastres
    │   ├── config.ts
    │   ├── calculator-adapter.ts
    │   ├── hash.ts
    │   ├── interfaces.ts
    │   ├── mapper.ts
    │   ├── parse-adapter.ts
    │   ├── schema.ts
    │   └── storage-adapter.ts
    └── biblioteca-congreso-nacional
        ├── config.ts
        ├── organizaciones-comunitarias/
        └── tasa-pobreza-ingresos/
```

## Cómo crear un nuevo módulo

### 1. Crea el directorio del módulo

```
src/modules/mi-nuevo-modulo/
```

### 2. Crear el archivo de configuración del módulo

Crea un `config.ts` dentro del nuevo módulo y utiliza el IndicatorBuilder del core para definir los indicadores.

```ts
import { IndicatorBuilder } from "../../core/IndicatorBuilder";
import { FREQUENCIES } from "../../core/enums/Frequencies";
import { MiCustomFetchAdapter } from "./mi-adapter-fetch";
import { MiCustomParseAdapter } from "./mi-adapter-parse";
import { MiMapperAdapter } from "./mapper";
import { MiHashAdapter } from "./hash";
import { MiStorageAdapter } from "./storage-adapter";
import { MiCalculatorAdapter } from "./calculator-adapter";

export const MI_NUEVO_MODULO_CONFIG = {
  "indicador-prueba": new IndicatorBuilder()
    .setName("Indicador Prueba")
    .setUrl("https://ejemplo.cl/data/{{year}}")
    .setFrequency(FREQUENCIES.year)
    .setFetchAdapter(new MiCustomFetchAdapter())
    .setParseAdapter(new MiCustomParseAdapter())
    .setMapperAdapter(new MiMapperAdapter())
    .setHashAdapter(new MiHashAdapter())
    .setStorageAdapter(new MiStorageAdapter())
    .setCalculatorAdapter(new MiCalculatorAdapter()) // opcional
    .build()
};
```

- Usa parámetros dinámicos `{{param}}` en la URL si necesitas que varíen.
- Puedes reutilizar adapters del core o crear los tuyos.
- El `CalculatorAdapter` es opcional: solo se usa si el indicador requiere cálculos de agregación.

### 3. Crea Adapters personalizados o reutiliza los existentes

- **FetchAdapter**: Define cómo obtener los datos (HTML, JSON, archivos, etc).
- **ParseAdapter**: Define cómo extraer y estructurar la información.
- **MapperAdapter**: Transforma la data extraída al formato que se almacena en la base de datos.
- **HashAdapter**: Genera una key única para evitar registros duplicados.
- **StorageAdapter**: Controla el almacenamiento de la data cruda.
- **CalculatorAdapter** (opcional): Calcula un resultado agregado (ej: totales, ratios) y lo persiste en la colección `indicator-results`.

### 4. Implementa la clase Scraper del módulo

Extiende la clase abstracta `ScrapeBase` para usar la configuración y adapters:

```ts
import { ScrapeBase } from "../../core/ScrapeBase";
import { MI_NUEVO_MODULO_CONFIG } from "./config";

export class MiNuevoModuloScraper extends ScrapeBase {
  constructor() {
    super("mi-nuevo-modulo", MI_NUEVO_MODULO_CONFIG);
  }
}
```

### 5. Registra tu módulo en el Factory

En `src/app.ts`, registra el nuevo scraper:

```ts
const scraperFactory = ScraperFactory.getInstance();
scraperFactory.register(new MiNuevoModuloScraper());
```

## Flujo ETL del sistema

1. El **CronRegistry** ejecuta periódicamente cada indicador según su frecuencia.
2. **FetchAdapter** obtiene la data cruda (HTML, JSON o archivo).
3. **ParseAdapter** extrae la información estructurada.
4. **MapperAdapter** normaliza la estructura.
5. **HashAdapter** genera la key única del registro.
6. **StorageAdapter** almacena la data cruda en MongoDB (ignorando duplicados).
7. **CalculatorAdapter** (si existe) calcula el resultado agregado y lo persiste en la colección `indicator-results`.

## API Endpoints

### Resumen

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Lista todos los módulos con sus indicadores |
| GET | `/emergencia-desastres` | Lista indicadores del módulo |
| GET | `/emergencia-desastres/:indicator` | Ejecuta scraping del indicador |
| GET | `/emergencia-desastres/:indicator/result` | Consulta el resultado calculado |
| GET | `/biblioteca-congreso-nacional` | Lista indicadores del módulo |
| GET | `/biblioteca-congreso-nacional/:indicator?year=YYYY` | Ejecuta scraping del indicador |

La documentación completa de la API está disponible como colección Bruno en `docs/api/`.

## Tipos de conexión soportados

| FetchAdapter | Tipo | Módulo que lo demuestra |
|-------------|------|------------------------|
| RequestPromiseAdapter | HTML scraping | emergencias-desastres, BCN tasa-pobreza |
| JsonFetchAdapter | JSON API | BCN organizaciones-comunitarias |
| PuppeteerAdapter | Páginas renderizadas con JS | Disponible en core |
| DownloadAdapter | Descarga de archivos CSV/XLSX | Disponible en core |

## Evitación de duplicados

- Cada registro obtiene una key única generada por el HashAdapter.
- Los esquemas Mongoose declaran el campo key como `unique: true`.
- Si ocurre un intento de inserción duplicada, el sistema captura el error y continúa.

## Colecciones en MongoDB

| Colección | Contenido |
|-----------|-----------|
| `emergencia-desastres` | Data cruda de simulacros (fecha, lugar, ciudad) |
| `tasa-pobreza-ingresos` | Data cruda de pobreza por ingresos (CASEN 2017/2022) |
| `organizaciones-comunitarias` | Data cruda de organizaciones comunitarias por año |
| `indicator-results` | Resultados calculados por el CalculatorAdapter |

## Testing

```bash
npm test
```

Los tests cubren:
- Tests unitarios para cada ParseAdapter, MapperAdapter y HashAdapter
- Tests de integración del flujo ETL completo (parse → map → hash)
- Tests de validación de input en las rutas API
- Validación de datos contra datos manuales de referencia
