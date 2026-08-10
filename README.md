# Software de extracción de datos para proyecto FONDECYT

Resiliencia comunitaria ante tsunami en la costa chilena: Modelando escenarios multidimensionales con una aproximación participativa.

Automatización de extracción, normalización y consulta de indicadores sociales desde diversas fuentes abiertas, basado en una arquitectura modular, extensible y documentada.

## Documentación

| Documento                                      | Contenido                                   |
| ---------------------------------------------- | ------------------------------------------- |
| [`docs/tesis/README.md`](docs/tesis/README.md) | Compilación del documento de tesis en LaTeX |
| [`docs/api/`](docs/api/)                       | Colección Bruno con los endpoints de la API |

## Requisitos

- Node.js LTS Jod (v22) — el proyecto incluye `.nvmrc`, por lo que basta con ejecutar `nvm use`
- Docker y Docker Compose

## Para ejecutar en local

1. Instalar dependencias

```bash
npm install
```

2. Configurar variables de entorno

```bash
cp .env.example .env
```

Todas las variables tienen valores por defecto que funcionan con el `docker-compose.yml` incluido, por lo que no es necesario modificar el `.env` para desarrollo local.

3. Levantar la base de datos

```bash
docker compose up -d
```

Esto levanta 3 servicios permanentes:

| Servicio      | Puerto | Descripción                 |
| ------------- | ------ | --------------------------- |
| MongoDB       | 27017  | Base de datos               |
| Mongo Express | 8081   | Interfaz web para MongoDB   |
| Metabase      | 3001   | Dashboards de visualización |

Más un cuarto servicio de un solo uso, `metabase-provision`, que espera a que Metabase responda, le aplica la configuración declarada en `.docker/metabase/provisioning.json` y termina. Es idempotente, así que en los siguientes arranques no hace ningún cambio.

El `docker-compose.yml` define además un servicio `tesis` para compilar el documento de tesis. Está bajo el perfil `docs`, por lo que `docker compose up` lo ignora por completo (ver [Documento de tesis](#documento-de-tesis)).

4. Levantar proyecto en modo desarrollo

```bash
npm run dev
```

5. Poblar la base de datos

En el primer arranque MongoDB está vacía, por lo que los dashboards de Metabase existen pero no muestran datos. Las queries ya están creadas y apuntando a las colecciones: se llenan solas en cuanto haya registros. Para ejecutar la extracción de todos los indicadores:

```bash
curl localhost:3000/emergencia-desastres/simulacros-2021
curl localhost:3000/emergencia-desastres/simulacros-2022
curl localhost:3000/emergencia-desastres/simulacros-2023
curl "localhost:3000/biblioteca-congreso-nacional/valdivia-tasa-pobreza-ingresos?year=2024"
curl localhost:3000/biblioteca-congreso-nacional/valdivia-organizaciones-comunitarias
```

Cada llamada extrae desde la fuente, almacena en MongoDB e ignora los registros que ya existan, así que se pueden repetir sin generar duplicados. Al recargar Metabase los gráficos ya muestran la data.

No es necesario volver a hacerlo en cada arranque: los datos persisten en el volumen de MongoDB. A partir de ahí, el `CronRegistry` mantiene al día los indicadores que declaran una frecuencia — los de la BCN se reextraen cada 1 de enero — mientras que los de simulacros usan `FREQUENCIES.once` y no se programan, porque su fuente es una instantánea de Wayback Machine que no cambia. Llamar a un endpoint en cualquier momento incorpora la data nueva que haya publicado la fuente.

## Estructura del proyecto

```
src
├── app.ts
├── api
│   ├── server.ts
│   ├── error-handler.ts
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

1. El **CronRegistry** ejecuta periódicamente cada indicador que declare una frecuencia. Los que usan `FREQUENCIES.once` no se programan y solo se ejecutan al llamar su endpoint.
2. **FetchAdapter** obtiene la data cruda (HTML, JSON o archivo).
3. **ParseAdapter** extrae la información estructurada.
4. **MapperAdapter** normaliza la estructura.
5. **HashAdapter** genera la key única del registro.
6. **StorageAdapter** almacena la data cruda en MongoDB (ignorando duplicados).
7. **CalculatorAdapter** (si existe) calcula el resultado agregado y lo persiste en la colección `indicator-results`. Solo crea un nuevo registro si el resultado cambió respecto al último almacenado, lo que permite mantener historial sin duplicados.

## API Endpoints

### Resumen

| Método | Endpoint                                             | Descripción                                 |
| ------ | ---------------------------------------------------- | ------------------------------------------- |
| GET    | `/`                                                  | Lista todos los módulos con sus indicadores |
| GET    | `/emergencia-desastres`                              | Lista indicadores del módulo                |
| GET    | `/emergencia-desastres/:indicator`                   | Ejecuta scraping del indicador              |
| GET    | `/emergencia-desastres/:indicator/result`            | Consulta el resultado calculado             |
| GET    | `/biblioteca-congreso-nacional`                      | Lista indicadores del módulo                |
| GET    | `/biblioteca-congreso-nacional/:indicator?year=YYYY` | Ejecuta scraping del indicador              |

La documentación completa de la API está disponible como colección Bruno en [`docs/api/`](docs/api/).

## Tipos de conexión soportados

| FetchAdapter          | Tipo                          | Módulo que lo demuestra                 |
| --------------------- | ----------------------------- | --------------------------------------- |
| RequestPromiseAdapter | HTML scraping                 | emergencias-desastres, BCN tasa-pobreza |
| JsonFetchAdapter      | JSON API                      | BCN organizaciones-comunitarias         |
| PuppeteerAdapter      | Páginas renderizadas con JS   | Disponible en core                      |
| DownloadAdapter       | Descarga de archivos CSV/XLSX | Disponible en core                      |

## Evitación de duplicados

- Cada registro obtiene una key única generada por el HashAdapter.
- Los esquemas Mongoose declaran el campo key como `unique: true`.
- Si ocurre un intento de inserción duplicada, el sistema captura el error y continúa.

## Colecciones en MongoDB

| Colección                     | Contenido                                            |
| ----------------------------- | ---------------------------------------------------- |
| `emergencia-desastres`        | Data cruda de simulacros (fecha, lugar, ciudad)      |
| `tasa-pobreza-ingresos`       | Data cruda de pobreza por ingresos (CASEN 2017/2022) |
| `organizaciones-comunitarias` | Data cruda de organizaciones comunitarias por año    |
| `indicator-results`           | Resultados calculados por el CalculatorAdapter       |

## Testing

```bash
npm test
```

Los tests cubren:

- Tests unitarios para cada ParseAdapter, MapperAdapter y HashAdapter
- Tests de integración del flujo ETL completo (parse → map → hash)
- Tests de validación de input en las rutas API
- Validación de datos contra datos manuales de referencia

## Scripts disponibles

| Script               | Descripción                                        |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Levanta el proyecto en modo desarrollo con nodemon |
| `npm run build`      | Compila TypeScript a JavaScript                    |
| `npm start`          | Ejecuta la versión compilada (`dist/app.js`)       |
| `npm test`           | Ejecuta los tests con Jest                         |
| `npm run test:watch` | Ejecuta los tests en modo watch                    |
| `npm run lint`       | Ejecuta ESLint                                     |
| `npm run lint:fix`   | Ejecuta ESLint y corrige errores automáticamente   |
| `npm run prettier`   | Formatea el código con Prettier                    |

## Visualización con Metabase

Metabase (`http://localhost:3001`) permite visualizar los datos almacenados en MongoDB a través de dashboards que se actualizan automáticamente a medida que se pueblan las colecciones, ya sea por el CronRegistry o al llamar los endpoints de extracción.

No requiere configuración manual: la cuenta administradora, la conexión a MongoDB, las queries y el dashboard están declarados en `.docker/metabase/provisioning.json` y se aplican solos al levantar el entorno.

Lo que el aprovisionamiento no puede crear son los datos. En el primer arranque el dashboard aparece completo pero con los gráficos vacíos, porque las colecciones de MongoDB todavía no tienen registros; se pueblan al ejecutar los endpoints de extracción (ver [Para ejecutar en local](#para-ejecutar-en-local)). Las queries no necesitan ningún ajuste posterior: leen las colecciones en vivo, así que reflejan tanto la primera carga como la data nueva que se vaya incorporando.

### Acceso

| Campo      | Valor                  |
| ---------- | ---------------------- |
| URL        | `http://localhost:3001` |
| Usuario    | `admin@fondecyt.local` |
| Contraseña | `Fondecyt2026!`        |

Las credenciales se pueden sobrescribir con las variables de entorno `MB_ADMIN_EMAIL` y `MB_ADMIN_PASSWORD`.

### Qué aplica el aprovisionamiento

- Crea la cuenta administradora y fija el idioma en español.
- Elimina la base de datos de ejemplo y archiva el dashboard de muestra que Metabase incluye por defecto.
- Conecta MongoDB como fuente de datos `FONDECYT CORE`.
- Crea las questions declaradas en `provisioning.json`.
- Crea el dashboard `Indicadores CORE` con esas questions.

El script es idempotente: si la instancia ya está configurada inicia sesión, y si una question o el dashboard ya existen los actualiza en lugar de duplicarlos. Metabase persiste su configuración en el volumen `metabase-data`, por lo que el aprovisionamiento solo hace trabajo real la primera vez o después de un `docker compose down -v`.

Para volver a ejecutarlo en cualquier momento:

```bash
docker compose up metabase-provision
```

O fuera de Docker, apuntando al puerto publicado:

```bash
MB_URL=http://localhost:3001 node .docker/metabase/provision.mjs
```

### Conexión a MongoDB

El aprovisionamiento registra la fuente de datos con estos valores:

| Campo                   | Valor         |
| ----------------------- | ------------- |
| Tipo                    | MongoDB       |
| Nombre                  | FONDECYT CORE |
| Host                    | `mongo`       |
| Puerto                  | 27017         |
| Base de datos           | `test`        |
| Usuario                 | `root`        |
| Contraseña              | `toor`        |
| Authentication database | `admin`       |

El host es `mongo` y no `localhost` porque Metabase se conecta dentro de la red de Docker.

### Questions incluidas

| Question                                    | Colección                     | Gráfico             |
| ------------------------------------------- | ----------------------------- | ------------------- |
| Simulacros por año                          | `indicator-results`           | Barras              |
| Simulacros por región (2021-2023)           | `emergencia-desastres`        | Barras horizontales |
| Tasa de pobreza por ingresos                | `tasa-pobreza-ingresos`       | Barras agrupadas    |
| Organizaciones comunitarias en el tiempo    | `organizaciones-comunitarias` | Línea temporal      |
| Organizaciones comunitarias por tipo (2024) | `organizaciones-comunitarias` | Barras horizontales |

Los simulacros se agrupan por `region` y no por `regionSource`: la fuente nombra la misma región de formas distintas según el año (`Aysén` y `Aysén- Cochrane`, `O'Higgins` y `O´Higgins`), por lo que `regionSource` partiría una región en varias barras. El campo `regionSource` conserva el texto original para auditar la extracción.

La serie temporal de organizaciones comunitarias recalcula el total sumando los tipos individuales en lugar de usar el campo `nDeOrganizacionesComunitariasSumaTotal`, porque la BCN no lo informa en todos los años.

### Agregar una nueva question

Basta con añadir una entrada al arreglo `cards` de `.docker/metabase/provisioning.json` y volver a ejecutar el aprovisionamiento. El campo `query` es un pipeline de agregación de MongoDB y `layout` define la posición de la tarjeta dentro del dashboard.

## Documento de tesis

El documento de tesis está en `docs/tesis/` y se compila dentro de un contenedor Docker, por lo que no es necesario instalar TeX Live en la máquina:

```bash
docker compose run --rm tesis
```

El PDF queda en `docs/tesis/tesis.pdf`. La guía completa (edición, limpieza, detalles del servicio Docker y tipografía) está en [`docs/tesis/README.md`](docs/tesis/README.md).
