# Convenciones

Estilo de código, nombres, tests, git, changelogs y documentación. Es la referencia para escribir código que se vea como el resto del repo.

## Estilo

El formato lo imponen Prettier y ESLint. No se discute a mano: se corre la herramienta.

- Prettier: `.prettierrc.json` (tabs, comillas dobles, sin trailing commas, arrow functions sin paréntesis en un solo parámetro).
- ESLint: `.eslintrc.json`, que extiende `standard-with-typescript` y `prettier`. Ignora `test/` y `tmp/`.
- `npm run lint` revisa, `npm run lint:fix` corrige, `npm run typecheck` compila sin emitir e incluye `test/`.

## Nombres

- Código en inglés: variables, funciones, clases y mensajes de error. Los textos de dominio en español (nombres de indicadores, claves de datos de la fuente) se dejan como los publica la fuente.
- Archivos de módulo en kebab-case (`parse-adapter.ts`, `storage-adapter.ts`). Las clases del core van en PascalCase y su archivo también (`ScrapeBase.ts`).
- Los nombres de módulo y de indicador son kebab-case y forman parte de la URL de la API. El nombre del módulo en la API sale de `super("<nombre>", ...)` y no siempre coincide con la carpeta (carpeta `emergencias-desastres`, módulo `emergencia-desastres`).

## Sin comentarios

El código no lleva comentarios: ni de línea, ni de bloque, ni JSDoc. Si algo necesita explicación, se resuelve con un nombre descriptivo o una función con nombre, y la explicación va en el commit, en el PR o en `docs/`. Las únicas excepciones son las directivas que interpreta una herramienta, como `// eslint-disable-next-line`.

## Tests

Jest con `ts-jest` (`jest.config.js`). El directorio `test/` replica la estructura de `src/`, y cada archivo termina en `.test.ts`.

```bash
npm test
npm run test:watch
npx jest test/core/ScrapeBase.test.ts
```

`jest.config.js` ignora `.worktree/`, para que un worktree anidado no duplique la suite.

| Tipo | Dónde | Qué prueba |
|---|---|---|
| Unitarios por adapter | `test/core/adapters/` y `test/modules/<modulo>/` (`parse-adapter`, `mapper`, `hash`, `storage-adapter`, `calculator-adapter`) | Cada adapter aislado, con `jest.spyOn` para fetch y Mongoose |
| Core | `test/core/` | `ScrapeBase`, `IndicatorBuilder` |
| ETL por módulo | `test/modules/<modulo>/**/etl.test.ts` | El flujo parse → map → hash sobre HTML o JSON de muestra, sin red ni base de datos |
| Validación contra datos de referencia | Dentro de los `etl.test.ts` | Compara lo extraído con valores verificados a mano contra la fuente |
| Rutas | `test/api/routes/` | Cada router montado en un servidor Express real en un puerto efímero (`test/api/helpers/test-server.ts`), con el scraper simulado |
| Error handler | `test/api/error-handler.test.ts` | Mapeo de errores a HTTP y logging |

Reglas prácticas:

- Los tests no tocan la red ni MongoDB. Todo lo externo se simula.
- Un indicador nuevo suma sus tests en `test/modules/<modulo>/`, con la misma estructura que los existentes.
- Un error nuevo suma un caso donde se lanza y, si cambia el mapeo, en `error-handler.test.ts`. Ver [errors.md](./errors.md).

## Git

### Ramas y releases

- El trabajo diario ocurre en `develop`, o en una rama que sale de él.
- `main` solo recibe releases. Cada release es un commit de merge `merge: develop into main for vX.Y.Z` y un tag `vX.Y.Z` sobre `main`.
- Antes de un release se documentan los cambios con la skill `release-changelog` (ver [Changelogs](#changelogs)).

### Commits

Se crean con la skill `git-commit` ([SKILL.md](../../.claude/skills/git-commit/SKILL.md)), que define el formato y las reglas. La forma es `<type>(<scope>): <subject>`.

Scopes en uso: `api`, `core`, `docker`, `readme`, `thesis`, `skills`, `changelog`, `metabase`, `mongo`, `eslint`, `emergencias-desastres`. Antes de inventar uno, mira `git log --oneline -n 30` y reutiliza los que existen.

### Hook pre-commit

Husky ejecuta `.husky/pre-commit`, que corre `npx lint-staged`. La configuración de `lint-staged` está en `package.json`: sobre los `*.ts` en stage ejecuta `eslint --fix` y luego `prettier --write`, y vuelve a agregar los archivos al commit.

- Los hooks se instalan solos con `npm install`, por el script `prepare` (`husky`). Para reinstalarlos: `npm run prepare`.
- Si el hook falla, el commit no se crea: corrige el error y vuelve a intentar. No se salta con `--no-verify`.

## Changelogs

Los changelogs técnicos viven en `docs/changelogs/`, un archivo por feature. Se generan con la skill `release-changelog` y las entradas históricas no se reescriben. La configuración del proyecto para la skill está en [CLAUDE.md](../../CLAUDE.md) (sección "Configuración de skills").

## Documentación

Los endpoints se documentan en la colección Bruno de `docs/api/` con la skill `bruno-endpoints`. Qué doc se actualiza cuando cambia qué: ver [Reglas para mantener esta carpeta](../README.md#reglas-para-mantener-esta-carpeta).
