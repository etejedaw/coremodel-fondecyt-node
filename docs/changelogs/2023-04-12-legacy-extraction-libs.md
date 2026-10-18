# Librerías de extracción de datos (arquitectura inicial)

**Released:** 2023-04-12

## Summary

Primera generación de extractores de indicadores sociales. Un `htmlExtractor` obtiene el HTML de una URL con dos estrategias intercambiables, Puppeteer para páginas renderizadas en el cliente y RequestPromise para HTML estático, y cada fuente tiene una librería propia que convierte ese HTML en un `Output` común. Las librerías cubren DataSocial, Observatorio Social, la Biblioteca del Congreso Nacional (BCN) y Emergencias y Desastres, y terminan agrupadas en `libs/dataExtractor`. Esta arquitectura se reemplazó más adelante por la de `IndicatorBuilder` y se eliminó del código.

## Highlights

- `htmlExtractor` con implementaciones Puppeteer y RequestPromise detrás de una interfaz común.
- Extractores para DataSocial, Observatorio Social, BCN (reporte comunal y estadísticas territoriales) y Emergencias y Desastres.
- Interfaz `Output` compartida por todos los extractores, con formato HTML entre los admitidos.

## Added

- `htmlExtractor` con `Getter`, `Puppeteer` y `RequestPromise`, más sus tests.
- Librerías `dataSocial` y `observatorioSocial`, cada una con su `Scraper` y su clase de extracción.
- Librería `bibliotecaCongresoNacional` con `BCNFactory`, `ReporteComunal` y `EstadisticasTerritoriales`.
- Librería `emergenciaYDesastres`.
- Interfaz común `Output` y un `index.ts` que exporta todas las librerías.
- `reset.d.ts` (ts-reset) para endurecer los tipos de la librería estándar.

## Changed

- Las librerías pasan de `utils/` a `libs/`, después a `libs/scrape` y finalmente a `libs/dataExtractor`. `htmlExtractor` se mueve de `helpers/` a `libs/`.
- Reglas de ESLint ampliadas; `strict-boolean-expressions` queda como advertencia.
- `.nvmrc` actualizado a la LTS vigente.

## Fixed

- Validaciones y tipos de formato en los extractores de DataSocial y Observatorio Social.
- El script de Prettier ahora cubre todo `src/`.
- Puppeteer deja de lanzarse con `headless: false` y corre en modo headless.

## Files of interest

- `src/libs/htmlExtractor/Getter.ts`
- `src/libs/dataExtractor/Output.ts`
- `src/libs/dataExtractor/bibliotecaCongresoNacional/BCNFactory.ts`
- `src/libs/dataExtractor/index.ts`

## Commits

- `c943a0f` — feat(htmlExtractor): create requestPromise helper
- `e4b8d12` — feature(htmlExtractor): create puppeteer module in helpers to extract html
- `46e4a9f` — fix(htmlExtractor): remove option parameter in Puppeteer launch
- `880a363` — test(htmlExtractor): generate Puppeteer, RequestPromise and Getter tests
- `8e9211e` — chore: change strict-boolean-expresions to warn in rules
- `b6bc96a` — chore: add htmlExtractor into index.ts
- `3b6d81b` — chore: change import path in some modules
- `db21fc9` — feat(dataSocial): generate module to extract data from dataSocial web
- `5417c38` — chore(dataSocial): add output format in scrape
- `9f798cf` — style(DataSocial): delete comments in bottom
- `558d215` — fix: modify prettier command to scope all the src directory
- `7e37934` — feat(observatorioSocial): generate module to extract data from observatorio Social web
- `5e028d2` — chore: move utils modules to libs directory
- `d81f236` — chore: add new rule in eslint
- `33cf106` — feat(scrape): add common interface to all the scrape webs
- `3f15e07` — fix(dataSocial): add validations and fix format type
- `e243ab5` — fix(observatorioSocial): add validations and fix format type
- `42237cc` — chore: add index.ts to export dataSocial and observatorioSocial
- `323a0af` — chore(htmlExtractor): move files to libs folder
- `e8709a2` — style: change output interface name
- `1153e2e` — feat(bibliotecaCongresoNacional): generate base module to bcn scrape
- `6420e3b` — chore(scrape): add html format in Output
- `53c1cf9` — feat(bibliotecaCongresoNacional): add new scrape lib to extract BCN data
- `cd44ccb` — feat(emergenciaYDesastres): generate new scrape lib
- `15423f2` — chore(libs): rename scrape directroy to dataExtractor
- `4d83eec` — build: add ts.reset lib
- `6b7de01` — build: update .nvmrc to the last lts version
- `705474b` — style: add more rules in eslint
- `633140a` — chore(dataExtractor): modify import and export in index.ts
