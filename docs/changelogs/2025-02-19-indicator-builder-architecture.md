# Arquitectura de módulos con IndicatorBuilder

**Released:** 2025-02-19

## Summary

Se reemplaza la arquitectura inicial por una basada en módulos declarativos. Cada módulo describe sus indicadores con `IndicatorBuilder`: nombre, descripción, URL, frecuencia y los adaptadores que obtienen (`FetchAdapter`) y procesan (`ParseAdapter`) los datos. La configuración se valida con zod. Cada módulo extiende `ScrapeBase`, cuyo `init(indicator)` ejecuta el ciclo fetch y parse del indicador pedido, y se registra en el singleton `ScraperFactory`, desde donde lo consume la API Express. El primer módulo migrado es `emergencias-desastres`. Las librerías `libs/dataExtractor` y `libs/htmlExtractor` y el módulo `database` anterior se eliminan.

## Highlights

- `IndicatorBuilder` con validación zod de la configuración de cada indicador.
- `FetchAdapter` abstracto con implementaciones `PuppeteerAdapter` y `RequestPromiseAdapter`, y `ParseAdapter` abstracto.
- `ScrapeBase` y el singleton `ScraperFactory` como registro de módulos.
- API Express con las rutas `GET /emergencia-desastres` (lista de indicadores) y `GET /emergencia-desastres/:indicator` (datos extraídos).

## Added

- `src/core/utils/IndicatorBuilder.ts`, con frecuencias `daily`, `weekly`, `monthly`, `year` y `once`.
- `src/core/ScrapeBase.ts` y `src/core/ScraperFactory.ts`.
- `src/core/adapters/fetch-adapter/` (`FetchAdapter`, `PuppeteerAdapter`, `RequestPromiseAdapter`) y `src/core/adapters/parse-adapter/ParseAdapter.ts`.
- Módulo `src/modules/emergencias-desastres` con `EmergenciaDesastreScraper`, su `Config.ts` y el adaptador `DateParser`.
- Rutas Express en `src/api/routes/`.
- Variables de entorno validadas con zod en `src/config/environment.ts`, y configuración de base de datos en `src/config/database.ts`.
- Test de `IndicatorBuilder`.

## Changed

- `app.ts` y `api/server.ts` separan la composición de la aplicación del servidor HTTP.
- Reglas de ESLint ajustadas.

## Removed

- `src/libs/dataExtractor` y `src/libs/htmlExtractor`.
- Módulo `src/database` (interfaz, implementación MongoDB y sus errores) y `src/api/Server.ts`.
- `config.ts` y `config.interface.ts`, reemplazados por `environment.ts` y `database.ts`.
- Helper `helpers/scrape/EmergenciaYDesastres.ts`, reemplazado por el nuevo módulo.

## Migration

- Una fuente nueva se agrega como módulo en `src/modules/<modulo>`: se declara un `Config.ts` con `IndicatorBuilder`, se extiende `ScrapeBase` y se registra la instancia en `ScraperFactory`.
- Las variables de entorno tienen valores por defecto en `environment.ts`, y una variable con formato inválido detiene el arranque.

## Files of interest

- `src/core/utils/IndicatorBuilder.ts`
- `src/core/ScrapeBase.ts`
- `src/core/ScraperFactory.ts`
- `src/core/adapters/fetch-adapter/FetchAdapter.ts`
- `src/modules/emergencias-desastres/Config.ts`
- `src/api/routes/emergencia-desastres.route.ts`

## Commits

- `4dce07c` — chore: add zod and express libs
- `442e880` — chore: reorder config logic. Add zod to validate environment variables
- `067bf16` — chore: split logic. server and app are in different files
- `b11c3e5` — feat(core): create indicator builder util to generate modules config
- `30f198f` — feat(core): create abstract class to define a patter in scrape modules
- `6a5def8` — feat(core): create scraper factory to save scrape instances
- `bf9fb9a` — feat(emergencia-desastres): created base module to scrape emergencia-desastre data
- `787e958` — style: update rules in eslint
- `7606dd6` — chore(api): create emergencia-desastres endpoint to get de indicators
- `3acaaca` — feat(core): create base fetch adapter abstract class with puppeteer and request-promise extensions
- `816a156` — feat(core): create base parse adapter abstract class
- `1828273` — chore(core): update indicator builder to use parse and fetch adapters instance
- `b144a3c` — chore(core): remove old abstract methods in scrape base and add init method
- `65bd213` — chore(core): update methods en scraper factory
- `a73aaf9` — feat(modules): add new emergencia desastres module with adapters, factory and builder
- `767e639` — feat(api): create endpoint to extract emergencia desastres data
- `e72979f` — chore: update app.ts with scrape factory
- `f7ead90` — style: update rules
- `b20471f` — style(modules): change config name file
- `9c7e483` — chore: update scrape factory with singleton
- `62f01ba` — style: change scrape base name
- `e4a16ba` — chore: add status code in get request
- `1b0e2d8` — test(core): create test to IndicatorBuilder
- `4ba5229` — style: rename class files
