# Unificación de extractores y scrapers con clases abstractas (arquitectura inicial)

**Released:** 2025-01-30

## Summary

Las librerías de `libs/dataExtractor` y los helpers de `helpers/scrape` dejan de repetir lógica por fuente. Ahora cada extractor hereda de las clases abstractas `DataExtractor` y `Scraper`, y cada helper de la clase abstracta `ScrapeBase`, con una función `innerInit` que centraliza el flujo común. Los errores se reportan de forma uniforme a través de `Output`, que gana campos de error y nuevos formatos. La BCN se divide en dos scrapers con su propia factory, uno para el reporte comunal y otro para las estadísticas territoriales. Se suman tests de los helpers y ajustes de Docker y del proceso de build. Es la última iteración de la arquitectura inicial, que se reemplazó por `IndicatorBuilder` al día siguiente del último commit de este grupo.

## Highlights

- Clases abstractas `DataExtractor` y `Scraper` en `libs/dataExtractor`, y `ScrapeBase` en `helpers/scrape`.
- Errores de HTML u output vacío reportados de forma uniforme a través de `Output`.
- BCN dividida en `ReporteComunal` y `EstadisticasTerritoriales`, cada una con su scraper y su factory.
- Tests de los helpers de Emergencias y Desastres, DataSocial y Observatorio Social.

## Added

- `libs/dataExtractor/DataExtractor.ts` y `libs/dataExtractor/Scraper.ts`.
- `helpers/scrape/ScrapeBase.ts`, con alias de tipos, código de entrada en `init` y la función `innerInit`.
- `BibliotecaCongresoNacionalFactory`, `ReporteComunalFactory`, `EstadisticasTerritorialesFactory` y sus scrapers.
- Campos de error y nuevos formatos en `Output`.
- Tests en `test/helpers/scrape/` para `EmergenciaYDesastres`, `DataSocial` y `ObservatorioSocial`.
- mongo-express en `docker-compose.yml`.
- Instrucciones de ejecución en el README.

## Changed

- Los extractores de Observatorio Social, DataSocial, Emergencias y Desastres y BCN heredan de las nuevas clases abstractas. Sus scrapers se renombran a `<Fuente>Scraper.ts`.
- Los helpers de Emergencias y Desastres, DataSocial y BCN heredan de `ScrapeBase`, y el de BCN usa la factory.
- Los tests de `htmlExtractor` se mueven a `test/libs/helpers/`.
- El `Dockerfile` usa la versión LTS Hydrogen por nombre en lugar de un número de versión fijo.
- El build ya no ejecuta los tests, y se actualizan los scripts de `package.json`.
- ESLint desactiva `strict-boolean-expressions` y `no-useless-constructor`.

## Removed

- Contenedor MongoDB de pruebas duplicado en `docker-compose.yml`.
- `BCNFactory`, `BCNTypes` y el `Scraper` único de la BCN, reemplazados por las nuevas factories.

## Fixed

- Títulos de los errores de HTML vacío y output vacío en `DataExtractor`.
- `baseUrl` se recorta antes de usarse.
- El `index.ts` de `dataExtractor` exporta las factories de la BCN.
- Se quita un `console.log` del helper de DataSocial.
- Import del test de Observatorio Social.

## Files of interest

- `src/libs/dataExtractor/DataExtractor.ts`
- `src/libs/dataExtractor/Scraper.ts`
- `src/helpers/scrape/ScrapeBase.ts`
- `src/libs/dataExtractor/bibliotecaCongresoNacional/BibliotecaCongresoNacionalFactory.ts`

## Commits

- `d1dbc99` — feat(helper): create abstract scrape base class to use in anohter scrape implementations
- `f359ec6` — chore(emergenciaYDesastres): update class to extends Scrape Base class
- `c9398eb` — chore(scarpe): add aliases type in scrapeBase
- `4604b68` — chore(emerfenciaydesastres): update with new scrapeBase types
- `9d5c737` — chore: update more error detalis
- `9d1e501` — test(helper): create EmergenciaYDesastres test
- `0c07a77` — test: move helper test to another directory
- `63f80e0` — helper: add code input in init scrapebase function
- `01fe767` — feat(libs): create abstract classes to use as base in data extractors and scrape
- `4f41f7e` — chore(observatorioSocial): update with new abstract classes
- `aadf9b2` — fix(observatorioSocial): rename html to htmlCode
- `dad7c55` — chore(dataExtractor): add new variable in Output interface
- `ec81950` — chore(dataExtractor): update DataSocial Scraper to extends Scraper abstract class
- `ebdbd4a` — chore(dataExtractor): add error data option in Scraper and Output
- `122be53` — chore(observatorioSocial): add new error outputs in search function
- `17eaf4d` — chore(dataSocial): extends DataExtractor abstract class in DataSocial
- `3346993` — chore(dataExtractor): add a custom search function in DataSocial abstract class
- `1c61916` — fix(dataExtractor): change error title in emptyHTML and emptyOutput DataExtracor abstract class
- `441ffff` — chore(emergeciaydesastres): update classes with new abstract class
- `8cee8e3` — chore(DataExtractor): add new format in Output interface
- `5e7bc7d` — chore(dataextrator): add more detail in errors inside DataExtractor abstract class:
- `0e3e10d` — chore(bibliotecacongresonacional): split scraper in two different methods, update the scraper with new abstract class and impleemnt factory pattern
- `5bd2610` — style: remove test code
- `8f983d3` — chore: add trim in baseUrl parameter
- `61733d5` — style(datasocial): add TODO message in DataSocialScraper
- `67ce801` — fix(dataextractor): update index with biblioteca nacional factories
- `21b93f0` — chore(scrape): add innerInit function to reduce duplicity in class that extends ScrapeBase
- `4c41734` — chore(emergenciaydesastres): update code to use innerInit function
- `f570a3a` — chore(datasocial): update DataSocial scrape with new ScrapeBase abstract class
- `b4e8b6d` — style(emergenciaydesastres): update scrape import
- `9b5a4bb` — add check validation error in test
- `eb258d5` — fix(datasocial): remove console log
- `763076f` — style: change no-useless-constructor eslint rule to warning
- `0b1e825` — test: update ObservatorioSocial test
- `d74e5ed` — ci: remove duplicate test mongo container and add mongo-express
- `3206481` — ci: update node specific version in Dockerfile to lts name
- `6c33001` — style: turn off strict-boolean-expressions and no-useless-constructor rules
- `1a17f9b` — lib(bibliotecacongresonacional): change import and exports in index
- `ac8fd5b` — chore(bibliotecacongresonacional): change class yo use factoriy
- `e23462b` — test(observatoriosocial): fix import module
- `ae27807` — ci: update Dockerfile to use last hydrogen version instance arbitraty number version
- `ac51c36` — docs: add exec instructions
- `23893bc` — ci: remove test in build time
- `adf7b1b` — chore: update packages scritps
- `4280b3c` — style: update index.ts to export instance of import/export
