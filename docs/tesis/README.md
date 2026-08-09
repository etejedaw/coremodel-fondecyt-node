# Tesis

Documento de tesis en LaTeX. Se compila dentro de un contenedor Docker, por lo
que **no es necesario instalar TeX Live en la máquina**.

## Archivos

| Ruta | Descripción |
| --- | --- |
| `tesis.tex` | Documento completo (único archivo fuente) |
| `referencias.bib` | Bibliografía en formato BibLaTeX APA |
| `img/` | Imágenes referenciadas por el documento |
| `tesis.pdf` | Salida compilada |
| `tmp/` | Archivos intermedios de LaTeX (ignorada por git) |

## Compilar

Desde la raíz del repositorio:

```bash
docker compose run --rm tesis
```

El PDF queda en `docs/tesis/tesis.pdf`.

La primera ejecución descarga la imagen `texlive/texlive` (~5,6 GB) y tarda unos
minutos. Después de eso, una compilación completa toma cerca de un minuto y una
reejecución sin cambios es instantánea, porque `latexmk` sólo repite las pasadas
necesarias.

## Editar y recompilar

1. Editar `tesis.tex` (o `referencias.bib`, o agregar imágenes a `img/`).
2. Volver a ejecutar `docker compose run --rm tesis`.

`latexmk` detecta qué cambió y ejecuta las pasadas de `xelatex` y `biber` que
correspondan. No hay que llamar a `biber` a mano ni repetir la compilación tres
veces para que cuadren las citas y las referencias cruzadas.

## Limpiar

```bash
docker compose run --rm tesis latexmk -C -auxdir=tmp -outdir=. tesis.tex
```

Elimina el PDF y todos los intermedios. Útil cuando la numeración o el índice
quedan inconsistentes tras un cambio grande.

## Detalles de la configuración

El servicio está definido en el `docker-compose.yml` de la raíz:

- **`profiles: ["docs"]`** — el servicio queda fuera de `docker compose up`,
  `down`, `ps` y `logs`. Sólo corre cuando se lo invoca por nombre con
  `docker compose run`. Levantar la aplicación no arranca el compilador.
- **`--rm`** — el contenedor se elimina al terminar. El código de salida es el
  de `latexmk`, por lo que sirve para CI.
- **Bind mount `./docs/tesis:/doc`** — el contenedor escribe directamente sobre
  el repositorio; no hay copia ni sincronización.
- **`user: "${DOCKER_UID:-1000}:${DOCKER_GID:-1000}"`** — evita que el PDF y los
  intermedios queden como `root`. Si tu UID/GID no son 1000:

  ```bash
  DOCKER_UID=$(id -u) DOCKER_GID=$(id -g) docker compose run --rm tesis
  ```

  No se usa `UID` directamente porque es una variable de sólo lectura en bash.
- **`-auxdir=tmp -outdir=.`** — los `.aux`, `.log`, `.bbl`, `.toc` y demás van a
  `tmp/`; sólo el PDF queda en `docs/tesis/`.
- **`-xelatex`** — obligatorio: el documento usa `fontspec`.

## Tipografía

La pauta de la escuela exige Times New Roman (texto) y Courier (código). Ambas
son fuentes propietarias de Microsoft y no están disponibles en Linux ni en la
imagen de TeX Live, por lo que el preámbulo usa `\IfFontExistsTF` para caer en
las clones libres métricamente idénticas de TeX Gyre: **Termes** (Times) y
**Cursor** (Courier). Si las fuentes de Microsoft están instaladas, se usan esas.
