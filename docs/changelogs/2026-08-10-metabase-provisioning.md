# Aprovisionamiento versionado de Metabase

**Released:** 2026-08-10

## Summary

La configuración de Metabase deja de hacerse a mano. Un servicio de un solo uso, `metabase-provision`, espera a que Metabase responda y aplica la configuración declarada en `.docker/metabase/provisioning.json`: cuenta de administrador, conexión a MongoDB y dashboard con sus tarjetas. Es idempotente, así que en una instancia ya configurada solo actualiza lo que cambió. Con eso, el estado de Metabase pasa a ser reproducible desde el repositorio y la instancia se vuelve efímera, sin volumen persistente. Para que la conexión funcione en el primer arranque, MongoDB crea al iniciar las colecciones vacías que Metabase necesita encontrar.

## Highlights

- Servicio `metabase-provision` con `provision.mjs` y `provisioning.json` versionados.
- Metabase efímero: `docker compose down` lo reinicia y el aprovisionamiento lo reconstruye.
- Seed de colecciones vacías en MongoDB con `.docker/mongo/init.js`.

## Added

- `.docker/metabase/provision.mjs` y `.docker/metabase/provisioning.json`.
- Servicio `metabase-provision` en `docker-compose.yml`.
- `.docker/mongo/init.js`, montado en `/docker-entrypoint-initdb.d`, que crea las colecciones de los tres indicadores y la de resultados.
- Secciones del README sobre aprovisionamiento, carga inicial de datos y seed de MongoDB.

## Changed

- Metabase ya no usa el volumen `metabase-data`, y su estado se reconstruye desde `provisioning.json`.

## Removed

- `docs/metabase/README.md`, la guía de configuración manual.

## Fixed

- El aprovisionamiento reintenta la conexión a la base de datos y tolera un schema vacío.
- El README describe el comportamiento real de la persistencia.

## Migration

- Los cambios en dashboards y tarjetas se hacen en `provisioning.json`, no desde la interfaz de Metabase: lo editado a mano se pierde con `docker compose down`.

## Files of interest

- `.docker/metabase/provision.mjs`
- `.docker/metabase/provisioning.json`
- `.docker/mongo/init.js`
- `docker-compose.yml`

## Commits

- `0fd5ed7` — feat(metabase): provision instance and dashboard from versioned config
- `7252bc3` — docs(readme): document metabase provisioning and initial data load
- `cd073a5` — feat(docker): make metabase ephemeral across compose down
- `f8fcab2` — fix(metabase): retry database connection and tolerate empty schema on provision
- `c5bd16d` — feat(mongo): seed empty collections so metabase can connect on first boot
- `c3ef016` — docs(readme): document mongo seeding and correct persistence behavior
