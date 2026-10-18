# Documento de tesis en LaTeX

**Released:** 2026-08-10

## Summary

La tesis asociada al proyecto se incorpora al repositorio en `docs/tesis/`: un único `tesis.tex` con todos los capítulos, la bibliografía en BibLaTeX con estilo APA y las imágenes que referencia. Se compila con un servicio `tesis` de `docker-compose.yml` que ejecuta `latexmk` con XeLaTeX sobre TeX Live, sin instalar LaTeX en la máquina. El PDF compilado se versiona junto al fuente. El contenido se completa con los capítulos de herramientas, diseño, implementación, resultados y conclusiones, y luego se revisa en precisión, citas y estilo académico.

## Highlights

- `docs/tesis/tesis.tex`, `referencias.bib` e `img/`, con el PDF compilado en `docs/tesis/tesis.pdf`.
- Servicio `tesis` (perfil `docs`) que compila con `latexmk` y deja los intermedios en `docs/tesis/tmp/`.
- Capítulos completos, desde el marco teórico hasta las conclusiones, con anexos de datos.

## Added

- Documento `docs/tesis/tesis.tex`, bibliografía `docs/tesis/referencias.bib` e imágenes en `docs/tesis/img/`.
- Servicio `tesis` en `docker-compose.yml`, bajo el perfil `docs`.
- PDF compilado `docs/tesis/tesis.pdf`.
- Capítulos de herramientas de desarrollo y diseño del prototipo, diagramas de arquitectura y listados de datos en el capítulo de implementación, y capítulos de resultados y conclusiones con anexos.
- Sección de fundamentos teóricos, pregunta de investigación y descripción del terremoto del 27F con cifras oficiales.
- Guía de compilación de la tesis en el README.

## Changed

- El título se acota a la dimensión sociocomunitaria y se actualiza el año de la portada.
- Objetivos específicos refinados, redacción y estilo académico revisados y números mayores a diez escritos con dígitos.
- La tabla de adaptadores une la fila duplicada del fetch adapter y describe los adaptadores de reserva.
- La figura del anexo A cabe en la página de su capítulo.
- La guía de Metabase pasa de `setup.md` a `docs/metabase/README.md`.
- La guía de compilación se integra en el README raíz y se elimina `docs/tesis/README.md`.

## Fixed

- Fuentes del preámbulo, configuración de `csquotes` y numeración de tablas y figuras.
- Metadatos incompletos y errores de autor y año en la bibliografía.
- Inconsistencias de contenido entre capítulos, citas de fuente en figuras de terceros y una tilde mal escrita.
- La ruta de `.claude/` en `.gitignore`.

## Files of interest

- `docs/tesis/tesis.tex`
- `docs/tesis/referencias.bib`
- `docker-compose.yml`

## Commits

- `787fb45` — chore: update gitignore with .claude, .DS_Store and tesis.pdf
- `ac7148b` — docs: add thesis images extracted from proyecto_titulo.md
- `1a33e20` — docs: add thesis bibliography in BibLaTeX APA format
- `32dcf50` — docs: add thesis document in LaTeX format with all chapters
- `af08622` — fix: correct .claude/ path and add trailing newline in gitignore
- `9a7911d` — build: add dockerized latexmk service for compiling the thesis
- `e97196a` — fix(thesis): correct preamble fonts, csquotes and table/figure numbering
- `d6a34bd` — docs: add thesis build guide and rename metabase setup to README
- `9cc7e3c` — docs: add compiled thesis pdf
- `29621cd` — docs(thesis): complete development tools and prototype design chapters
- `390f4e3` — docs(thesis): add architecture diagrams and data listings to implementation chapter
- `df9a51e` — docs(thesis): add results and conclusions chapters with data annexes
- `51e56e5` — docs(thesis): narrow title to sociocommunity dimension and update cover year
- `babc1dd` — docs(thesis): describe 27F earthquake with official figures and source
- `49b36f6` — docs(thesis): complete bibliography metadata and fix author and year errors
- `87e1456` — docs(thesis): add theoretical foundations section to theoretical framework
- `6c5b1cb` — docs(thesis): add research question and refine specific objectives
- `7d6f874` — docs(thesis): fix content inconsistencies across chapters
- `dd47da0` — docs(thesis): improve academic wording and style
- `033e714` — docs(thesis): write numbers over ten as digits and fix accent typo
- `7e1f400` — docs(thesis): add source citations to third-party figures
- `8b62824` — docs(thesis): rebuild pdf
- `845fde0` — docs(thesis): merge duplicate fetch adapter row and describe spare adapters
- `ffde689` — docs(thesis): fit appendix A figure on its chapter page
- `bc497a3` — docs(thesis): rebuild pdf
- `eba784f` — docs(readme): consolidate thesis build guide into root readme
- `c672fc3` — docs(thesis): rebuild pdf
