# Indicador de participación electoral

**Released:** 2026-10-19

## Summary

El módulo `biblioteca-congreso-nacional` suma un tercer indicador, `valdivia-participacion-electoral`, que corresponde a *Civic Participation* (SCCP) del modelo CORE. La fuente prevista era el CSV de participación del SERVEL, pero esa publicación fue retirada y hoy el SERVEL solo la muestra en tableros Power BI. El indicador lee en su lugar la sección de indicadores electorales del reporte comunal de la BCN, el mismo documento que usa la tasa de pobreza, que republica los datos del SERVEL. Reutiliza el `RequestPromiseAdapter`, el parámetro `{{year}}` y el resolver de años programados, sin cambios en el `core`. Cada reporte informa la elección más reciente, así que el registro se identifica por elección y no por el año consultado.

## Highlights

- Indicador `valdivia-participacion-electoral` con inscritos, votantes, porcentaje publicado y porcentaje calculado para la comuna, la región y el país.
- Parse por encabezados: reconoce las columnas aunque cambien de nombre entre reportes ("Inscritos Total" o "N° Electores", "Votación" o "N° Votantes").
- Llave por unidad territorial y elección, de modo que dos reportes con la misma elección no duplican registros.
- Pregunta "Participación electoral por elección" en Metabase y endpoints documentados en Bruno.

## Added

- Subcarpeta `src/modules/biblioteca-congreso-nacional/participacion-electoral/` con `parse-adapter.ts`, `mapper.ts`, `hash.ts`, `storage-adapter.ts`, `schema.ts`, `interfaces.ts` e `index.ts`.
- `ParticipacionElectoralParseAdapter`: toma cada tabla cuyo título contenga `participación (%)`, obtiene el nombre de la elección desde ese título y ubica las columnas por encabezado. Devuelve `[]` si no encuentra una tabla con las columnas esperadas.
- `ParticipacionElectoralMapperAdapter`: convierte los conteos con punto de miles, guarda el porcentaje publicado como `participacionFuente` y calcula `participacion` como votantes sobre inscritos, ambos redondeados a dos decimales.
- `ParticipacionElectoralHashAdapter`: slug de `unidadTerritorial`, `eleccion`, `module` e `indicator`.
- Indicador declarado en `config.ts` con frecuencia anual y `resolveCurrentAndPreviousYears`.
- Colección `participacion-electoral` en `.docker/mongo/init.js`.
- Pregunta "Participación electoral por elección" en `.docker/metabase/provisioning.json`: barras horizontales con Valdivia, Región de Los Ríos y país (sin voto exterior) por elección.
- `extraer-participacion-electoral.yml` y `participacion-electoral.yml` en la colección Bruno.
- Tests de parse, mapper, hash, schema, storage y `etl.test.ts`, más los casos de la ruta con y sin `year`.

## Changed

- `listar-indicadores.yml` incluye el indicador nuevo.
- `docs/context/modules.md` y `docs/context/data.md` describen el indicador, su llave, los encabezados variables, el reporte que devuelve la BCN para un año sin publicar y el dato erróneo del reporte 2023.
- El README agrega la extracción de participación electoral al poblado de la base.

## Migration

- En una base existente, la colección `participacion-electoral` se crea con el primer `insertMany`; `init.js` solo actúa sobre un volumen vacío.
- El schema fija el nombre de la colección para que Mongoose no lo pluralice.

## Files of interest

- `src/modules/biblioteca-congreso-nacional/participacion-electoral/parse-adapter.ts`
- `src/modules/biblioteca-congreso-nacional/participacion-electoral/mapper.ts`
- `src/modules/biblioteca-congreso-nacional/participacion-electoral/hash.ts`
- `src/modules/biblioteca-congreso-nacional/config.ts`
- `.docker/metabase/provisioning.json`

## Commits

- `9aa8cfb` — feat(biblioteca-congreso-nacional): add electoral participation indicator
- `c9de974` — test(biblioteca-congreso-nacional): cover electoral participation indicator
- `2da42bf` — feat(mongo): create participacion-electoral collection on init
- `6770b76` — feat(metabase): add electoral participation question
- `3ffb129` — docs(api): document electoral participation endpoints
- `ff58465` — docs: describe electoral participation indicator
- `56c97ac` — docs(readme): add electoral participation to database population
- `db544cc` — test(biblioteca-congreso-nacional): cover electoral participation storage adapter
