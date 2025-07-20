# Software de extracción de datos para proyecto FONDECYT

Resiliencia comunitaria ante tsunami en la costa chilena: Modelando escenarios multidimensionales con una aproximación participativa.

Automatización de extracción, normalización y consulta de indicadores sociales desde diversas fuentes abiertas, basado en una arquitectura modular, extensible y documentada.

## Para ejecutar en local:

1. Levantar la base de datos

```bash
docker compose up
```

2. Crear imagen de docker

```bash
docker build . -t tesis
```

3. Levantar proyecto

```bash
docker run -p 3000:3000 --net=host tesis
```

## Estructura del proyecto

```
src
├── api              # Endpoints HTTP (no prioridad en la tesis)
├── config           # Configuración general (DB, entorno)
├── core             # Clases base, adapters genéricos y flujo principal
│   ├── adapters     # Adapters reutilizables para scraping, parsing, almacenamiento, etc.
│   ├── IndicatorBuilder.ts
│   ├── ScrapeBase.ts
│   └── ScraperFactory.ts
└── modules          # Módulos independientes para cada fuente/dominio
    ├── <modulo>
    │   ├── config.ts              # Definición de indicadores (por módulo)
    │   ├── hash.ts                # Generación del hash único por indicador
    │   ├── interfaces.ts          # Tipado específico
    │   ├── mapper.ts              # Normalización/mapeo de la data
    │   ├── parse-adapter.ts       # Extracción de datos (cheerio, JSON, etc.)
    │   ├── schema.ts              # Modelo de datos Mongoose
    │   └── storage-adapter.ts     # Almacenamiento de la data procesada
```

## Cómo crear un nuevo módulo

### 1. Crea el directorio del módulo

Ejemplo:

```
src/modules/mi-nuevo-modulo/
```

### 2. Crear el archivo de configuración del módulo

Crea un `config.ts` dentro del nuevo módulo y utiliza el IndicatorBuilder del core para definir los indicadores.

```
// modules/mi-nuevo-modulo/config.ts
import { IndicatorBuilder } from "../../core/IndicatorBuilder";
import { MiCustomFetchAdapter } from "./mi-adapter-fetch";
import { MiCustomParseAdapter } from "./mi-adapter-parse";
import { MiMapperAdapter } from "./mapper";
import { MiHashAdapter } from "./hash";
import { MiStorageAdapter } from "./storage-adapter";

export const MI_NUEVO_MODULO_CONFIG = {
  "indicador-prueba": new IndicatorBuilder()
    .setName("Indicador Prueba")
    .setUrl("https://ejemplo.cl/data/{{year}}")
    .setFrequency("year")
    .setFetchAdapter(new MiCustomFetchAdapter())
    .setParseAdapter(new MiCustomParseAdapter())
    .setMapperFunction(new MiMapperAdapter())
    .setHashAdapter(new MiHashAdapter())
    .setStorageAdapter(new MiStorageAdapter())
    .build()
};
```

- Usa parámetros dinámicos `{{param}}` en la URL si necesitas que varíen.
- Puedes reutilizar adapters del core o crear los tuyos en /adapters.

### 3. Crea Adapters personalizados o reutiliza los existentes

- FetchAdapter: Define cómo obtener los datos (HTML, JSON, archivos, etc).
- ParseAdapter: Define cómo extraer y estructurar la información. Puedes encontrar Adapters ya hechos en `src/core/adapters`.
- MapperAdapter: Define la forma en el que la data extraída del parse se transforma y se almacena en la base de datos.
- HashAdapter: Define una key única la cuál evitará que se almacenen registros duplicados
- StodageAdapter: Define el cómo se controla el almacenamiento

### 4. Implementa la clase Scraper del módulo

Extiende la clase abstracta `ScrapeBase` (en `core/ScrapeBase.ts`) para usar la configuración y adapters:

```
import { ScrapeBase } from "../../core/ScrapeBase";
import { MI_NUEVO_MODULO_CONFIG } from "./Config";

export class MiNuevoModuloScraper extends ScrapeBase {
  constructor() {
    super("mi-nuevo-modulo", MI_NUEVO_MODULO_CONFIG);
  }
}
```

- Solo necesitas pasar el nombre y la configuración.

### 5. Registra tu módulo en el Factory

En la inicialización de tu app, registra el nuevo scraper en la ScraperFactory del core:

```
import { ScraperFactory } from "../../core/ScraperFactory";
import { MiNuevoModuloScraper } from "./modules/mi-nuevo-modulo/MiNuevoModuloScraper";

const scraperFactory = ScraperFactory.getInstance();
scraperFactory.register(new MiNuevoModuloScraper());
```

## ¿Cómo funciona el sistema internamente?

1. El usuario (o API) solicita un indicador.
2. El **ScraperFactory** obtiene el módulo y ejecuta el flujo:
   - **FetchAdapter** obtiene la data.
   - **ParseAdapter** la extrae.
   - **MapperAdapter** normaliza la estructura.
   - **HashAdapter** genera la key única del registro.
   - **StorageAdapter** almacena (ignorando duplicados).
3. Se retorna la data procesada.

## Evitación de duplicados

- Cada registro obtiene una key única generada automáticamente por el HashAdapter.
- Los esquemas Mongoose declaran el campo key como unique: true.
- Si ocurre un intento de inserción duplicada, el sistema captura el error y continúa, mostrando un log informativo.

## Extensibilidad

- **Agrega módulos fácilmente**: Solo debes definir la configuración y la clase del módulo, reutilizando o extendiendo adapters según la fuente.
- **Parámetros dinámicos**: Puedes usar placeholders como {{year}}, {{region}}, etc. en las URLs de los indicadores, y el sistema los reemplazará dinámicamente.
- **Adapters reutilizables**: Los adapters del core pueden ser usados en cualquier módulo, y puedes crear nuevos adapters para necesidades específicas (ej: descarga de archivos, parsing de JSON, etc).

## Ejemplo de flujo de extracción

1. El usuario (o API) solicita datos de un indicador específico de un módulo.
2. El ScraperFactory obtiene el módulo correspondiente.
3. El módulo (subclase de ScrapeBase) usa su configuración y ejecuta el FetchAdapter para obtener los datos.
4. El resultado crudo es procesado por el ParseAdapter para entregar la estructura final de datos.
5. (Opcional) Los datos pueden ser almacenados o exportados según la necesidad del proyecto.

## Clases y helpers disponibles en `core/`

- `ScraperFactory`: Registro central de módulos.
- `ScrapeBase`: Base para todos los módulos.
- `IndicatorBuilder`: Builder para indicadores.
- `adapters/`: Adapters listos para scraping web, JSON, descarga de archivos, etc.
- `utils/IndicatorBuilder.ts`: Utilidad para construcción y validación de indicadores.

## Notas

- La arquitectura es modular y extensible. Si el día de mañana cambias la forma de almacenar o mostrar datos (API, CSV, MongoDB, web, etc), la lógica central de scraping permanece igual.
- El foco está en la automatización y la posibilidad de agregar nuevas fuentes/indicadores con poco esfuerzo y alta cohesión.
