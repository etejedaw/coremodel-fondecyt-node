# Software de extracción de datos para proyecto FONDECYT

Resiliencia comunitaria ante tsunami en la costa chilena: Modelando escenarios multidimensionales con una aproximación participativa.

Automatización de extracción, normalización y consulta de indicadores sociales desde diversas fuentes abiertas, basado en una arquitectura modular, extensible y documentada.

## Documentación

| Documento                              | Contenido                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| [`docs/README.md`](docs/README.md)     | Índice de la documentación: arquitectura, módulos, datos, errores e infraestructura |
| [`docs/api/`](docs/api/)               | Colección Bruno con los endpoints de la API, sus respuestas y errores         |
| [`docs/tesis/`](docs/tesis/)           | Documento de tesis en LaTeX y su PDF compilado                                |

## Requisitos

- Node.js en la versión fijada en `.nvmrc` (basta con `nvm use`)
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

`npm run dev` y `npm start` cargan el `.env` con el soporte nativo de Node (`--env-file-if-exists`) y Docker Compose lo lee para los puertos. Si no existe, la API usa los defaults de `src/config/environment.config.ts`, que coinciden con el `docker-compose.yml`. Detalle en [`docs/context/infrastructure.md`](docs/context/infrastructure.md#variables-de-entorno).

3. Levantar la base de datos

```bash
docker compose up -d
```

Esto levanta MongoDB, Mongo Express y Metabase, más el aprovisionamiento de Metabase. El detalle de los servicios está en [`docs/context/infrastructure.md`](docs/context/infrastructure.md).

4. Levantar proyecto en modo desarrollo

```bash
npm run dev
```

5. Poblar la base de datos

En el primer arranque MongoDB está vacía, por lo que los dashboards de Metabase existen pero no muestran datos. Las queries ya están creadas y apuntando a las colecciones: se llenan solas en cuanto haya registros. Para ejecutar la extracción de todos los indicadores:

```bash
curl -X POST localhost:3000/emergencia-desastres/simulacros-2021
curl -X POST localhost:3000/emergencia-desastres/simulacros-2022
curl -X POST localhost:3000/emergencia-desastres/simulacros-2023
curl -X POST "localhost:3000/biblioteca-congreso-nacional/valdivia-tasa-pobreza-ingresos?year=2024"
curl -X POST localhost:3000/biblioteca-congreso-nacional/valdivia-organizaciones-comunitarias
```

Cada llamada extrae desde la fuente, almacena en MongoDB e ignora los registros que ya existan, así que se pueden repetir sin generar duplicados. Al recargar Metabase los gráficos ya muestran la data.

Tras un `docker compose down` hay que repoblar; qué conserva cada comando está en [`docs/context/infrastructure.md`](docs/context/infrastructure.md#qué-conserva-cada-comando). Después, el `CronRegistry` mantiene al día los indicadores que declaran una frecuencia; cómo se programan y cuáles quedan fuera está en [`docs/architecture.md`](docs/architecture.md). Llamar a un endpoint en cualquier momento incorpora la data nueva que haya publicado la fuente.

Los endpoints, sus parámetros y sus errores están en [`docs/api/`](docs/api/); el mapeo de errores a HTTP, en [`docs/context/errors.md`](docs/context/errors.md).

## Scripts disponibles

| Script               | Descripción                                        |
| -------------------- | -------------------------------------------------- |
| `npm run typecheck`  | Revisa los tipos con `tsc`, incluido `test/`       |
| `npm run dev`        | Levanta el proyecto en modo desarrollo con nodemon |
| `npm run build`      | Compila TypeScript a JavaScript                    |
| `npm start`          | Ejecuta la versión compilada (`dist/app.js`)       |
| `npm test`           | Ejecuta los tests con Jest                         |
| `npm run test:watch` | Ejecuta los tests en modo watch                    |
| `npm run lint`       | Ejecuta ESLint                                     |
| `npm run lint:fix`   | Ejecuta ESLint y corrige errores automáticamente   |
| `npm run prettier`   | Formatea el código con Prettier                    |

## Metabase

Metabase queda disponible en `http://localhost:3001` con el dashboard `Indicadores CORE`, sin configuración manual. Las credenciales de administrador por defecto están declaradas en `.docker/metabase/provision.mjs` y se pueden sobrescribir con `MB_ADMIN_EMAIL` y `MB_ADMIN_PASSWORD`. Los gráficos aparecen vacíos hasta poblar la base (paso 5). Cómo funciona el aprovisionamiento, la conexión y las questions está en [`docs/context/infrastructure.md`](docs/context/infrastructure.md).

## Testing y convenciones

Los tests se ejecutan con `npm test`. Convenciones de código, tests, hooks de git y commits: [`docs/context/conventions.md`](docs/context/conventions.md).

## Documento de tesis

El documento de tesis está en `docs/tesis/`: `tesis.tex` es el único archivo fuente, `referencias.bib` la bibliografía e `img/` las imágenes que referencia.

La redacción y la compilación se apoyan en las skills de [uach-thesis-skills](https://github.com/etejedaw/uach-thesis-skills): `thesis-format`, con la pauta de formato de la escuela, y `thesis-build`, que compila el `.tex` dentro de un contenedor Docker con TeX Live fijado por digest, por lo que no es necesario instalar LaTeX en la máquina. Están instaladas en `.claude/skills/` con el CLI de [skills.sh](https://skills.sh) y `skills-lock.json` registra la versión instalada. No se editan a mano: cualquier cambio se hace en su repositorio.

Para compilar, desde la raíz del proyecto:

```bash
bash .claude/skills/thesis-build/build.sh docs/tesis/tesis.tex --out docs/tesis
```

El PDF queda en `docs/tesis/tesis.pdf` y los archivos intermedios en `docs/tesis/aux/`, ignorada por git. `latexmk` decide qué pasadas de `xelatex` y `biber` repetir, así que basta con volver a ejecutar el comando tras cada edición. El script usa tu UID y GID, así que los archivos generados no quedan como `root`. La primera ejecución descarga la imagen de TeX Live (~5,6 GB) y tarda unos minutos.

Si el índice o la numeración quedan inconsistentes tras un cambio grande, agrega `--clean` para borrar el PDF y los intermedios antes de recompilar.

Para actualizar las skills a la última versión del repositorio:

```bash
npx skills update -p
```
