# Ejecución programada con cron, errores de dominio y logger

**Released:** 2026-02-17

## Summary

Los indicadores se actualizan solos. La frecuencia de cada uno pasa a ser una expresión cron, y `CronRegistry` programa una tarea por indicador para todos los módulos registrados en `ScraperFactory`. También permite detener una tarea individual o todas. Para que esas ejecuciones en segundo plano sean diagnosticables, se agrega una jerarquía de errores (`BaseError`, `DomainError`, `ServiceError`) y un logger estructurado con pino, que registra los fallos con su contexto. El módulo `emergencias-desastres` se completa con los adaptadores de mapper, hash y storage, para seguir el mismo pipeline que la BCN.

## Highlights

- Frecuencias como expresiones cron, con atajos en el enum `FREQUENCIES`.
- `CronRegistry` programa, detiene individualmente y detiene en bloque las tareas de cada indicador.
- Errores de dominio y de servicio tipados en `src/core/errors`.
- Logger pino en `src/core/logger`.

## Added

- `src/core/enums/Frequencies.ts` con `daily`, `weekly`, `monthly`, `year` y `once` (sin programación).
- `src/core/CronRegistry.ts` sobre `node-cron`.
- `src/core/errors`: `DomainError` (`AdapterNotFoundError`, `ScraperNotFoundError`, `ScraperAlreadyRegisteredError`, `ParseError`) y `ServiceError` (`StorageError`, `FetchError`, `CronExecutionError`).
- `src/core/logger` con pino.
- Método `find` en `StorageAdapter`, para que los endpoints lean desde MongoDB.
- Adaptadores `mapper`, `hash`, `schema` y `storage-adapter` en `emergencias-desastres`.

## Changed

- `IndicatorBuilder` valida la frecuencia como expresión cron.
- `ScrapeBase`, `ScraperFactory` y los storage adapters lanzan los nuevos errores tipados y registran con el logger.
- `app.ts` inicia `CronRegistry` al arrancar.
- Mensaje de error del guardado masivo con mongoose en `emergencias-desastres`.

## Migration

- `setFrequency` recibe una expresión cron. Los valores del enum `FREQUENCIES` reemplazan a los textos `"daily"`, `"weekly"` y demás.

## Files of interest

- `src/core/CronRegistry.ts`
- `src/core/enums/Frequencies.ts`
- `src/core/errors/index.ts`
- `src/core/logger/Logger.ts`

## Commits

- `c95c45b` — chore: update frequency to use cron syntax and generate a cron enum tas shortcut
- `a1fca5b` — feat(emergencias-desastres): add missing adapters in config module
- `a35606b` — chore(emergencias-desastres): update error message in mongoose bulk
- `1985081` — feat(core): create cron registry
- `3afaf2f` — feat(core): add errores module
- `d0965ff` — feat(core): create pino logger module
- `80611ad` — chore(core): add find method in storage adapter to use in endpoints
- `0a6aa88` — chore(core): update crone to stop individually indicator
