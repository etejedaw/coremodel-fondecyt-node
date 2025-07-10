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
├── api # Endpoints http
├── config # Archivos de configuración
├── core # Clases base, adapters, factory y helpers genéricos
└── modules  # Módulos independientes para cada fuente/dominio
    ├── <modulo>
    │   ├── adapters  # Adapters específicos para scraping/parsing
    │   ├── <modulo>Scraper.ts  # Lógica principal del módulo
    │   └── Config.ts # Configuración de indicadores del módulo
```

## Cómo crear un nuevo módulo

### 1. Crea el directorio del módulo

Ejemplo:

```
src/modules/mi-nuevo-modulo/
```

### 2. Define la configuración de indicadores

Crea un `Config.ts` dentro del nuevo módulo y utiliza el IndicatorBuilder del core para definir los indicadores.

```
// modules/mi-nuevo-modulo/Config.ts
import { IndicatorBuilder } from "../../core/utils/IndicatorBuilder";
import { MiCustomFetchAdapter } from "./adapters/MiCustomFetchAdapter";
import { MiCustomParseAdapter } from "./adapters/MiCustomParseAdapter";

export const MI_NUEVO_MODULO_CONFIG = {
  "indicador-prueba": new IndicatorBuilder()
    .setName("Indicador Prueba")
    .setUrl("https://ejemplo.cl/data/{{year}}")
    .setFrequency("annual")
    .setFetchAdapter(new MiCustomFetchAdapter())
    .setParseAdapter(new MiCustomParseAdapter())
    .build()
};
```

- Usa parámetros dinámicos `{{param}}` en la URL si necesitas que varíen.
- Puedes reutilizar adapters del core o crear los tuyos en /adapters.

### 3. Crea Adapters personalizados o reutiliza los existentes

- FetchAdapter: Define cómo obtener los datos (HTML, JSON, archivos, etc).
- ParseAdapter: Define cómo extraer y estructurar la información. Puedes encontrar Adapters ya hechos en `src/core/adapters`.

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

- **ScraperFactory (core)**: Singleton responsable de centralizar y exponer los módulos registrados. Permite obtener el scraper de cada módulo y sus indicadores asociados.
- **ScrapeBase (core)**: Clase abstracta base para los módulos. Define el flujo de scraping: recibe la configuración, ejecuta los adapters y orquesta la extracción.
- **IndicatorBuilder (core)**: Builder que facilita la definición y validación de los indicadores de cada módulo. Permite declarar parámetros dinámicos, adapters y metadatos de forma clara y fluida.
- **Adapters (FetchAdapter, ParseAdapter)**: Permiten desacoplar la forma en que se obtiene y procesa la data. Puedes usar los del core (fetch, puppeteer, parseos básicos) o definir tus propios adapters especializados.
- **Config (Config.ts)**: Cada módulo puede declarar indicadores y su lógica usando el builder, junto con los adapters requeridos.

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

`ScraperFactory`: Registro central de módulos.
`ScrapeBase`: Base para todos los módulos.
`IndicatorBuilder`: Builder para indicadores.
`adapters/`: Adapters listos para scraping web, JSON, descarga de archivos, etc.
`utils/IndicatorBuilder.ts`: Utilidad para construcción y validación de indicadores.

## Notas

- La arquitectura es modular y extensible. Si el día de mañana cambias la forma de almacenar o mostrar datos (API, CSV, MongoDB, web, etc), la lógica central de scraping permanece igual.
- El foco está en la automatización y la posibilidad de agregar nuevas fuentes/indicadores con poco esfuerzo y alta cohesión.
