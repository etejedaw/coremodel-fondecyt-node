# Parámetros programados y tasa de pobreza por año

**Released:** 2026-10-18

## Summary

Antes, el cron llamaba a `init` sin parámetros, así que un indicador con `{{year}}` en la URL, como `valdivia-tasa-pobreza-ingresos`, no podía ejecutarse de forma programada. Ahora cada indicador puede declarar una lista ordenada de parámetros candidatos que se resuelve en cada corrida. El cron prueba el primero y, si la fuente todavía no tiene datos (`ParseError`), sigue con el siguiente. Los parámetros usados se agregan a cada registro. La tasa de pobreza se programa con el año actual y los dos anteriores, guarda el año en el registro y en la llave de deduplicación, y toma los nombres de sus campos de los años que trae el encabezado CASEN de cada reporte. Metabase compara las mediciones por unidad territorial y año, e incluye CASEN 2020.

## Highlights

- `IndicatorBuilder.setScheduledParams`, que recibe un resolver de parámetros candidatos evaluado en cada corrida del cron.
- Fallback al siguiente candidato cuando la extracción falla con `ParseError`.
- `year` en los registros de `tasa-pobreza-ingresos` y en su hash.
- Campos `casen<año>` derivados del encabezado de la tabla, en lugar de `casen2017` y `casen2022` fijos.

## Added

- `scheduledParams?: () => Array<Record<string, string>>` en `Indicator` y `ScrapeBase.getIndicatorScheduledParams(indicator)`, que devuelve `[{}]` si el indicador no define resolver.
- `runWithFirstAvailableParams` en `CronRegistry.ts`, que recorre los candidatos y relanza el error si no es `ParseError` o si no quedan candidatos.
- Resolver `resolveCurrentAndPreviousYears` en `src/modules/biblioteca-congreso-nacional/config.ts`.
- Campo `year` en el schema de `tasa-pobreza-ingresos` y el tipo `OutputWithYear`.
- Campo `casen2020` en el schema y la serie `CASEN 2020` en la pregunta de Metabase.
- Tests de `CronRegistry`, `IndicatorBuilder`, `ScrapeBase` y del parse adapter y el mapper de `tasa-pobreza-ingresos`.

## Changed

- `ScrapeBase` agrega los parámetros de la corrida a cada registro, antes de `indicator` y `module`.
- El hash de `tasa-pobreza-ingresos` concatena `unidadTerritorial`, `year`, `module` e `indicator`, así que el mismo territorio se guarda una vez por año.
- El parse adapter de `tasa-pobreza-ingresos` lee las dos primeras filas como encabezado, extrae los años con `casen\s*(\d{4})` y nombra cada columna `casen<año>`. Si no encuentra mediciones, devuelve `[]`.
- `Input` y `Output` pasan a `Record<CasenField, ...>`, y el mapper convierte todas las mediciones que lleguen.
- `casen2017`, `casen2020` y `casen2022` dejan de ser obligatorios en el schema.
- La pregunta de tasa de pobreza en `.docker/metabase/provisioning.json` filtra registros con `year`, agrupa por unidad territorial y año, y rotula el eje X como "Unidad territorial y año".
- `docs/architecture.md`, `docs/context/data.md`, `docs/context/modules.md`, la colección Bruno y la tesis describen los parámetros programados, el fallback, el año en la llave y los campos según el encabezado. El PDF se recompila.

## Migration

- Los registros de `tasa-pobreza-ingresos` guardados antes de este cambio no tienen `year`, así que la pregunta de Metabase no los muestra. Para verlos, hay que volver a extraer con `POST` y `?year=YYYY`.
- Un indicador con resolver debe devolver un arreglo de candidatos, no un objeto.

## Files of interest

- `src/core/CronRegistry.ts`
- `src/core/IndicatorBuilder.ts`
- `src/core/ScrapeBase.ts`
- `src/modules/biblioteca-congreso-nacional/config.ts`
- `src/modules/biblioteca-congreso-nacional/tasa-pobreza-ingresos/parse-adapter.ts`
- `.docker/metabase/provisioning.json`

## Commits

- `90d8559` — feat(core): resolve scheduled params per cron run and add them to records
- `2144936` — feat(biblioteca-congreso-nacional): schedule poverty rate with current year and key it by year
- `f2f6dfb` — feat(metabase): compare poverty rate CASEN measurements by territory and year
- `eff23c1` — docs: describe scheduled params and year in poverty rate key
- `246a015` — docs(thesis): describe year in poverty rate key and scheduled params
- `db2ac58` — docs(thesis): rebuild pdf
- `5ea5d80` — feat(core): fall back to next scheduled params candidate on parse error
- `6be53a7` — fix(biblioteca-congreso-nacional): schedule poverty rate with current and two previous years
- `732a75e` — docs: describe scheduled params fallback candidates
- `159b660` — fix(biblioteca-congreso-nacional): name poverty rate fields after casen header years
- `58198d5` — feat(metabase): add casen 2020 series to poverty rate question
- `2a305e2` — docs: describe header-driven casen fields for poverty rate
- `865f286` — docs(thesis): describe scheduled year fallback and update test count
- `94fd83a` — docs(thesis): rebuild pdf
