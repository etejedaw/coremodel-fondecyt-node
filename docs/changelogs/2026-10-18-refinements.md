# Puertos configurables y skills de workflow

**Released:** 2026-10-18

## Summary

Dos ajustes pequeños e independientes. Los puertos del host de MongoDB, mongo-express y Metabase se pueden cambiar con variables de entorno, para levantar el proyecto en máquinas donde esos puertos ya están ocupados. Además, se instalan desde [workflow-skills](https://github.com/etejedaw/workflow-skills) tres skills de apoyo al desarrollo: commits, changelogs y la colección Bruno.

## Highlights

- Variables `DB_PORT`, `MONGO_EXPRESS_PORT` y `METABASE_PORT` para los puertos del host.
- Skills `bruno-endpoints`, `git-commit` y `release-changelog` en `.claude/skills/`.

## Added

- `MONGO_EXPRESS_PORT` y `METABASE_PORT` en `.env.example`, junto a `NODE_ENV`.
- `.claude/skills/bruno-endpoints`, `.claude/skills/git-commit` y `.claude/skills/release-changelog`, registradas en `skills-lock.json`.

## Changed

- `docker-compose.yml` publica MongoDB en `${DB_PORT:-27017}`, mongo-express en `${MONGO_EXPRESS_PORT:-8081}` y Metabase en `${METABASE_PORT:-3001}`. Sin variables definidas, los puertos son los mismos de antes.

## Files of interest

- `docker-compose.yml`
- `.env.example`
- `skills-lock.json`

## Commits

- `28c89d2` — chore(docker): make host ports configurable through env vars
- `a8b0bd5` — chore(skills): install workflow skills from skills.sh
