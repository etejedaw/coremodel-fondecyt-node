# CalculatorAdapter y resultados agregados

**Released:** 2026-04-03

## Summary

Los indicadores pueden derivar resultados agregados a partir de los datos extraídos. `IndicatorBuilder` acepta un `CalculatorAdapter` opcional, que `ScrapeBase.init` ejecuta después de guardar los registros: calcula el resultado, lo persiste en MongoDB y lo deja disponible en un endpoint propio. El primer caso es `TsunamiDrillsCalculatorAdapter`, que cuenta los simulacros de tsunami en total y por ciudad. Los resultados se guardan como historial en la colección `indicator-results`, y un resultado idéntico al último registrado no se vuelve a insertar.

## Highlights

- `CalculatorAdapter` abstracto con `calculate`, `save` y `find`.
- `TsunamiDrillsCalculatorAdapter` con `totalDrills` y `drillsByCity`.
- Endpoint `GET /emergencia-desastres/:indicator/result` con el último resultado calculado.
- Historial de resultados sin duplicados consecutivos.

## Added

- `src/core/adapters/calculator-adapter/CalculatorAdapter.ts`.
- `setCalculatorAdapter` en `IndicatorBuilder` y `getCalculatorAdapter` en `ScrapeBase`.
- `src/modules/emergencias-desastres/calculator-adapter.ts`, registrado en los indicadores de simulacros.
- Ruta `/:indicator/result` en `emergencia-desastres`, con 404 cuando el indicador no existe, no tiene calculadora o todavía no hay resultados.
- Tests del calculator adapter.
- Sección del README sobre el comportamiento del historial.

## Changed

- `GET /<modulo>/:indicator` vuelve a devolver solo `{ data }` en ambos módulos, después de un paso intermedio en que incluía el resultado calculado. Ese resultado se consulta en `/result`.

## Fixed

- El calculador conserva el historial de resultados en lugar de sobrescribirlo y omite los resultados repetidos.

## Files of interest

- `src/core/adapters/calculator-adapter/CalculatorAdapter.ts`
- `src/modules/emergencias-desastres/calculator-adapter.ts`
- `src/core/ScrapeBase.ts`
- `src/api/routes/emergencia-desastres.route.ts`

## Commits

- `7a00afa` — feat(core): add optional CalculatorAdapter to IndicatorBuilder and ScrapeBase
- `a487bbc` — feat(emergencias-desastres): add TsunamiDrillsCalculatorAdapter with totalDrills and drillsByCity
- `f8faddd` — refactor(api): adapt routes to new init() return format with optional calculated field
- `bbafc83` — test(emergencias-desastres): add calculator adapter tests
- `68b32a1` — feat(core): persist calculator results in MongoDB and add find method
- `d2bb261` — feat(api): add /result endpoint and revert init response to data only
- `9b9253f` — test(emergencias-desastres): update calculator adapter tests
- `19d321b` — fix(emergencias-desastres): preserve calculator result history and skip duplicates
- `918224b` — docs: update README and TODO with calculator history behavior
