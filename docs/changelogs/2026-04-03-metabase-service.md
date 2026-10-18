# Servicio Metabase para visualización

**Released:** 2026-04-03

## Summary

Se incorpora Metabase al `docker-compose.yml` para visualizar en dashboards los indicadores guardados en MongoDB. El servicio corre en el puerto 3001 y guarda su propia configuración en un volumen persistente. La conexión a MongoDB y la creación de los dashboards se hacen a mano, siguiendo una guía paso a paso en `docs/metabase/setup.md`.

## Highlights

- Servicio `metabase` en `docker-compose.yml`, expuesto en `http://localhost:3001`.
- Volumen `metabase-data` para conservar la configuración entre reinicios.
- Guía de configuración inicial y de conexión a MongoDB.

## Added

- Servicio `metabase` y volumen `metabase-data` en `docker-compose.yml`.
- `docs/metabase/setup.md`, con los pasos para crear la cuenta de administrador y conectar MongoDB.
- Sección de Metabase en el README.

## Files of interest

- `docker-compose.yml`
- `docs/metabase/setup.md`

## Commits

- `a3c328d` — feat: add Metabase service to docker-compose with persistent volume
- `0f4f09f` — docs: add Metabase setup guide, update README and TODO
- `1d591ff` — docs: mark phase 9 as complete and update Metabase section in README
