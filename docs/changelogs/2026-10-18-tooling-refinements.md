# Ajustes de tooling y entorno

**Released:** 2026-10-18

## Summary

Ajustes pequeños e independientes del entorno de desarrollo. Un hook de pre-commit formatea y corrige con lint los archivos en stage. El `.env` se carga con el flag nativo de Node, lo que elimina `dotenv`. Las imágenes de Docker Compose quedan fijadas por versión y la imagen de producción no ejecuta los lifecycle scripts. La configuración de ESLint no hereda la de carpetas superiores, y git y jest ignoran el directorio de worktrees. Además, se agrega la primera versión del `CLAUDE.md`.

## Highlights

- Pre-commit con Husky y lint-staged (`eslint --fix` y `prettier --write` sobre `*.ts`).
- `.env` cargado con `--env-file-if-exists`, sin la dependencia `dotenv`.
- Imágenes `mongo:6.0`, `mongo-express:1.0` y `metabase/metabase:v0.64.x`.

## Added

- `.husky/pre-commit`, que ejecuta `npx lint-staged`, y la configuración `lint-staged` en `package.json`. El README documenta los hooks.
- `CLAUDE.md` con las convenciones del proyecto para el agente.
- `.worktree/` en `.gitignore`, y en `modulePathIgnorePatterns` y `testPathIgnorePatterns` de `jest.config.js`.

## Changed

- Los scripts `start` y `dev` cargan el `.env` con `node --env-file-if-exists=.env`. `dev` registra `ts-node` con `-r ts-node/register`. El README y `docs/context/infrastructure.md` lo describen.
- `docker-compose.yml` reemplaza `mongo:6`, `mongo-express` y `metabase/metabase:latest` por tags explícitos.
- El `Dockerfile` instala las dependencias de producción con `--ignore-scripts`, para no ejecutar el `prepare` de Husky.
- `.eslintrc.json` declara `"root": true`.
- `docs/context/errors.md` marca `AdapterNotFoundError` como reservado para desarrollos posteriores.

## Removed

- Dependencia `dotenv`.

## Files of interest

- `package.json`
- `.husky/pre-commit`
- `docker-compose.yml`
- `Dockerfile`
- `jest.config.js`

## Commits

- `d2a5b77` — chore(git): ignore worktree directory
- `f6ebdad` — docs(claude): add project conventions in claude.md
- `da7aad5` — chore(docker): pin compose images to explicit version tags
- `aaa6b17` — chore(eslint): mark config as root to avoid inheriting parent configs
- `25aa605` — build(docker): skip lifecycle scripts when installing production dependencies
- `5f0d729` — chore(husky): add pre-commit hook running lint-staged
- `d8c05a2` — docs(readme): document git hooks
- `3c88151` — chore(test): ignore worktree directory in jest
- `7c6e6c1` — build(deps): load .env with native node flag and drop dotenv
- `5e21dc4` — docs(readme): document native .env loading in dev and start
- `9bc451c` — docs: describe native .env loading in infrastructure
- `5b71c14` — docs: mark AdapterNotFoundError as reserved in errors
