# Actualización de runtime: Node LTS Jod y TypeScript 5

**Released:** 2026-08-09

## Summary

El proyecto pasa de Node LTS Hydrogen (v18) a Node LTS Jod (v22) y de TypeScript 4 a TypeScript 5. Las versiones recientes de cheerio y undici no cargan sobre Hydrogen, y zod v4 requiere TypeScript 5 para compilar sus tipos. En la misma pasada se actualizan dependencias transitivas para cerrar 14 advisories de seguridad.

## Highlights

- Node LTS Jod en `.nvmrc` y en las tres etapas del `Dockerfile`.
- TypeScript 5.x.
- 14 advisories de seguridad resueltos en dependencias transitivas.

## Changed

- `.nvmrc` pasa de `lts/hydrogen` a `lts/jod`.
- El `Dockerfile` usa `node:jod-alpine` en las etapas `base`, `builder` y `runner`.
- TypeScript actualizado a 5.x.
- Dependencias transitivas actualizadas en `package-lock.json`.
- El README indica Node.js LTS Jod (v22) como requisito.

## Migration

- En local, ejecutar `nvm use` (o instalar Node 22) y luego `npm install`.
- Las imágenes Docker existentes se reconstruyen con `docker compose build`.

## Files of interest

- `.nvmrc`
- `Dockerfile`
- `package.json`

## Commits

- `469bc24` — fix: upgrade typescript to 5.x for zod 4 compatibility
- `994f95c` — fix: migrate node runtime to lts/jod so cheerio and undici can load
- `8b24ea6` — fix: bump transitive dependencies to patch 14 advisories
