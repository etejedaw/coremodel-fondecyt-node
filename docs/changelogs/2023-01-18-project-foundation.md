# Base del proyecto

**Released:** 2023-01-18

## Summary

Se crea el esqueleto del servicio en TypeScript: dependencias, ESLint, Prettier y Jest, un módulo de configuración leído desde variables de entorno, un módulo de base de datos MongoDB y un logger con Winston. Tras una primera versión acoplada, la configuración y la base de datos se reorganizan con un patrón de inyección: `app.ts` crea las instancias y se las entrega a `Server`, de modo que ningún módulo depende directamente de la configuración. El proyecto queda ejecutable en Docker, con MongoDB levantado por `docker-compose.yml`.

## Highlights

- Módulo `config` que expone las variables de entorno, incluida `NODE_ENV`, con un `.env.example` de referencia.
- Módulo `database` con una interfaz genérica y su implementación en `database/mongodb`.
- Logger Winston en `helpers/logger`.
- `Dockerfile`, `.nvmrc` y `docker-compose.yml` con MongoDB y una base de pruebas.

## Added

- Configuración base del repositorio: `package.json`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc.json` y `jest.config.js`.
- Módulo `config` (`config.ts`, `config.interface.ts`).
- Módulo `database` con `database.interface.ts` y la implementación `mongodb/mongodb.ts`.
- Logger Winston en `helpers/logger/winston`.
- Punto de entrada `app.ts` y clase `Server`.
- `docker-compose.yml` con MongoDB y una base de pruebas, `Dockerfile` y `.nvmrc`.

## Changed

- La configuración y la base de datos se instancian en `app.ts` y se inyectan en `Server`, en lugar de que cada módulo importe la configuración.
- La lógica de MongoDB se separa en `database/mongodb`, y las interfaces de base de datos y logger quedan en la carpeta de su módulo y no en la de su implementación.
- `server.ts` pasa a `Server.ts`.
- La configuración por entorno se consolida en un solo archivo y se elimina `config.dev.ts`.

## Fixed

- Error de construcción en el `Dockerfile`.

## Files of interest

- `src/app.ts`
- `src/config/config.ts`
- `src/database/mongodb/mongodb.ts`
- `src/helpers/logger/winston/winston.ts`
- `docker-compose.yml`
- `Dockerfile`

## Commits

- `f0cea63` — Initial commit
- `ca3adcc` — Update README.md
- `4597903` — build(deps): Installed base project dependencies
- `e6d278b` — chore(deps): add new dependencies
- `743b932` — ci: create docker-compose to run mongodb
- `28d7a89` — chore: add example .env file
- `76a0e4e` — feat(config): add config module with env variables
- `69f0ec7` — feat: create mongo database module
- `d00defe` — feat(core): generate basic file to execute run the software
- `17e5787` — fix: change config using injector pattern
- `38d8b3e` — fix: remove config dependencies of database module
- `46772a6` — fix(core): remove config dependecy from app
- `f4447dc` — refactor(core): create new instance of config and database module
- `e573f7d` — chore: rename database class and interfaces
- `817f611` — refactor: separate the database logic in a mongodb module
- `ad8c6e3` — chore: add NODE_ENV into config module
- `9553d72` — feature: add logger module
- `5e3e249` — refactor(config): separate dev environment in a separate file
- `f755b6b` — refactor(database): move database interface in database forlder instead mongodb folder
- `481cbf0` — refactor(logger): move logger interface in logger folder instead winston folder
- `c8739fd` — refactor: change app and server names
- `191cee1` — ci: add mongodb test database
- `f5077c4` — ci: create Dockerfile
- `b93ad63` — ci: create .nvmrc file with lts node version
- `d6c68c3` — fix: solve Dockerfile bug
- `c6524ca` — refactor: reduce config files in config module
