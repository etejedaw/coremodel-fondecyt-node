# Helpers de scraping y manejo de errores de MongoDB (arquitectura inicial)

**Released:** 2023-09-28

## Summary

Sobre las librerías de `libs/dataExtractor` se agrega una capa de helpers en `helpers/scrape` que orquesta la extracción de cada fuente: obtiene los datos con la librería correspondiente y los deja listos para usarse. Hay helpers para Emergencias y Desastres, DataSocial, Observatorio Social y la BCN, más una función para descargar archivos desde una URL. En paralelo, el módulo MongoDB gana errores tipados de conexión y autenticación. Igual que las librerías, esta capa se eliminó más adelante con la migración a `IndicatorBuilder`.

## Highlights

- Interfaz `ScrapeData`, que acompaña los datos extraídos con su `Output`, y helpers por fuente en `helpers/scrape`.
- Helper `downloadFile` para descargar archivos desde una URL.
- Errores `ConnectionError` y `AuthError` en el módulo MongoDB, capturados al iniciar la aplicación.

## Added

- `helpers/scrape/ScrapeData.ts` y helpers `EmergenciaYDesastres`, `DataSocial`, `ObservatorioSocial` y `BibliotecaCongresoNacional`.
- `helpers/downloadFile.helpers.ts`.
- `database/mongodb/connection.error.ts` y `database/mongodb/auth.error.ts`.
- Script `lint:fix` en `package.json`.
- Código opcional de slug en `Output`, usado por Observatorio Social.

## Changed

- `app.ts` captura los errores de conexión y autenticación de MongoDB.
- `config.get` devuelve un tipo de dato más preciso.
- El reporte comunal de la BCN cambia su formato de retorno.
- `.nvmrc` actualizado a Node LTS Hydrogen.

## Fixed

- MongoDB usa `strictQuery`.
- La URL base de Observatorio Social usa `https`.

## Files of interest

- `src/helpers/scrape/ScrapeData.ts`
- `src/helpers/downloadFile.helpers.ts`
- `src/database/mongodb/mongodb.ts`

## Commits

- `d075f3a` — feat(helpers): generate base to scrape data lib
- `676a985` — feat(scarpe): generate EmergenciaYDesastre scraper data
- `e2f1adf` — chore(mongodb): add error class
- `b202d59` — chore(core): add ConnectionError in catch connection
- `24c84ef` — chore: add lint:fix script in package.json
- `6449b80` — fix: add strictQuery true in mongodb module
- `ec1a0ad` — chore(mongodb): add more error validations
- `24c660a` — build: update nvmrc file to the last lts hydrogen version
- `21ceb7b` — feat(dataSocial): dataSocial scrape helper create
- `31d20d3` — chore(dataExtractor): add option slug code in Output interface to ObservatorioSocial lib
- `ef36c61` — feat(helpers): create function to download files from urls
- `b42c97f` — feat(observatorioSocial): create basic Observatorio Social helper
- `10a1236` — chore: downloadfile helper
- `b4b1487` — chore(config): update return data type in get method
- `ef68877` — fix: add https in baseUrl
- `306eb21` — style: add identation
- `5993da5` — libs(bibliotecaCongresonacional): modify format return in Reporte Comunal
- `0a4d4bd` — chore(helpers): add datasocial init
- `31b92d1` — feat(bibliotecaCongresoNacional): generate scrape helper
