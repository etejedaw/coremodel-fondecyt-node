# Gráfico de tasa de pobreza con mediciones variables

**Released:** 2026-10-18

## Summary

La pregunta "Tasa de pobreza por ingresos" de Metabase devolvía una columna fija por medición (`CASEN 2017`, `CASEN 2020` y `CASEN 2022`). Cuando ningún reporte consultado trae una de ellas, por ejemplo CASEN 2020 en el reporte 2024, la columna queda vacía y Metabase dibuja una sola serie rotulada "(vacío)". La consulta pasa a formato largo: una fila por unidad territorial, año y medición presente, y el gráfico separa las series por la columna `medicion`. Una medición que el reporte no trae simplemente no aparece.

## Highlights

- La pregunta de pobreza vuelve a mostrar una serie por medición CASEN, con su leyenda.
- La consulta ya no depende de una lista fija de mediciones.

## Fixed

- Serie única "(vacío)" en la pregunta de pobreza cuando una medición CASEN no está en ningún reporte consultado.

## Changed

- El pipeline de la pregunta en `.docker/metabase/provisioning.json` toma con `$objectToArray` los campos `casen<año>` de cada registro, los separa con `$unwind` y los agrupa por `unidadTerritorialYear` y `medicion`. `graph.dimensions` pasa a `unidadTerritorialYear` y `medicion`, y `graph.metrics` a `tasa`.

## Files of interest

- `.docker/metabase/provisioning.json`

## Commits

- `0a70830` — fix(metabase): chart poverty rate measurements present in each report
