# Endpoint de resumen, colección Bruno y suite de tests

**Released:** 2026-04-03

## Summary

Se agrega un endpoint raíz que lista todos los módulos registrados junto con sus indicadores, nombre, URL y frecuencia. La API queda documentada en una colección Bruno en formato OpenCollection dentro de `docs/api/`. En paralelo se arma una suite de tests en tres niveles: unitarios para los parse, mapper y hash adapters de cada indicador, de integración contra las fuentes reales y de validación de entrada en las rutas. Las rutas validan que el indicador pedido exista y delegan los errores a Express en lugar de dejarlos sin capturar.

## Highlights

- `GET /` devuelve el resumen de módulos e indicadores.
- Colección Bruno en `docs/api/`, con entorno `local`.
- Tests unitarios, de integración y de rutas para `biblioteca-congreso-nacional` y `emergencias-desastres`.

## Added

- Método `getIndicatorName` en `ScrapeBase`.
- Endpoint de resumen en `src/api/routes/index.ts`.
- `docs/api/opencollection.yml`, `docs/api/environments/local.yml` y requests por módulo: listado de indicadores, organizaciones comunitarias, tasa de pobreza por ingresos y simulacros 2021 a 2023.
- Tests en `test/modules/` para los parse, mapper y hash adapters de cada indicador.
- Tests de integración en `test/integration/` para los tres indicadores.
- Tests de validación de rutas en `test/api/`.

## Changed

- `ScrapeBase` deja de validar adaptadores que ya garantiza `IndicatorBuilder`.
- Formato Prettier en `CronRegistry`, `ScrapeBase` y `ScraperFactory`.

## Fixed

- Las rutas responden 404 cuando el indicador no existe y pasan los errores a `next`.
- Script `lint:fix`. ESLint ignora `test/`.
- El test de `IndicatorBuilder` usa el enum `FREQUENCIES` y la ruta de import correcta.

## Files of interest

- `src/api/routes/index.ts`
- `docs/api/opencollection.yml`
- `test/integration/`
- `test/api/`

## Commits

- `3dee707` — feat(core): add getIndicatorName method to ScrapeBase
- `cec6f19` — feat(api): add summary endpoint listing all modules and indicators
- `cc404e4` — docs: add Bruno OpenCollection API documentation and update TODO
- `9bdb477` — style(core): apply prettier formatting
- `83f6138` — fix: correct lint:fix script and add test/ to eslint ignore
- `c78cc25` — fix(test): update IndicatorBuilder test to use FREQUENCIES enum and correct import path
- `d0a78ef` — test(modules): add unit tests for ParseAdapter, MapperAdapter and HashAdapter
- `01f92e4` — test: add integration tests and manual data validation for all modules
- `3ef15f4` — refactor(core): simplify ScrapeBase by removing unnecessary adapter validation
- `6f27337` — fix(api): add input validation and error handling in route endpoints
- `4acd0de` — test(api): add route input validation tests for both modules
- `e9d04d3` — refactor(test): remove comments from integration tests
