# Compilación de la tesis con la skill thesis-build

**Released:** 2026-10-18

## Summary

La compilación de la tesis deja de vivir en este repositorio y pasa a las skills de [uach-thesis-skills](https://github.com/etejedaw/uach-thesis-skills), instaladas en `.claude/skills/` con el CLI de skills.sh. `thesis-build` compila el `.tex` dentro de un contenedor con TeX Live fijado por digest y usa el UID y el GID del usuario. `thesis-format` aporta la pauta de formato de la escuela. El servicio `tesis` de `docker-compose.yml` se elimina, porque duplicaba lo que hace la skill, y la imagen `texlive/texlive:latest` que usaba podía cambiar a mitad del desarrollo.

## Highlights

- Skills `thesis-build` y `thesis-format` en `.claude/skills/`, con su versión registrada en `skills-lock.json`.
- Compilación reproducible con TeX Live fijado por digest.
- `docker-compose.yml` queda solo con la infraestructura del proyecto.

## Added

- `.claude/skills/thesis-build` (`SKILL.md`, `build.sh`, `docker-compose.yml`) y `.claude/skills/thesis-format`.
- `skills-lock.json`, con el origen y el hash de cada skill.

## Changed

- La tesis se compila con `bash .claude/skills/thesis-build/build.sh docs/tesis/tesis.tex --out docs/tesis`.
- Los intermedios pasan de `docs/tesis/tmp/` a `docs/tesis/aux/`.
- `.gitignore` versiona `.claude/skills/` y solo ignora `.claude/settings.local.json`.
- README actualizado con el nuevo flujo y el comando de actualización `npx skills update -p`.
- PDF recompilado con la skill.

## Removed

- Servicio `tesis` y su perfil `docs` en `docker-compose.yml`.

## Migration

- Reemplazar `docker compose run --rm tesis` por `bash .claude/skills/thesis-build/build.sh docs/tesis/tesis.tex --out docs/tesis`.
- Para limpiar antes de compilar, agregar `--clean` en lugar de ejecutar `latexmk -C` en el contenedor.
- La carpeta local `docs/tesis/tmp/` ya no se usa y se puede borrar.

## Files of interest

- `.claude/skills/thesis-build/build.sh`
- `.claude/skills/thesis-build/docker-compose.yml`
- `skills-lock.json`
- `README.md`

## Commits

- `45cc289` — chore(skills): install uach thesis skills from skills.sh
- `0bd35cb` — chore(docker): remove thesis service in favor of thesis-build skill
- `500d657` — docs(readme): document thesis build with thesis-build skill
- `74c2655` — docs(thesis): rebuild pdf
