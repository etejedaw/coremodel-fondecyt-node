# Tesis con participación electoral y metas por objetivo

**Released:** 2026-10-19

## Summary

La tesis incorpora el indicador de participación electoral (SCCP) en todos los capítulos que describen el sistema y contrasta cada objetivo con su meta. El capítulo de viabilidad clasifica los seis indicadores analizados por dimensión y fundamenta que SCCP sea institucional. Los capítulos de implementación, resultados y conclusiones describen el indicador, el cambio de fuente del SERVEL a la BCN, sus resultados, su validación y sus tiempos. La tesis pasa a contar indicadores del modelo CORE (cuatro implementados) en lugar de extracciones, describe la metodología de desarrollo, enuncia la hipótesis en forma afirmativa y cambia el título para cubrir ambas dimensiones.

## Highlights

- Sección "Metodología de desarrollo" con la adaptación de Scrum al proyecto.
- Tabla de cumplimiento con meta y valor logrado por objetivo: CE = 2 en ambas dimensiones, CT = 2 y CEI = CES = 2.
- Subsección de resultados de participación electoral, con tabla, respuesta de la API y gráfico de Metabase.
- Título "Integración de datos y resiliencia comunitaria en las dimensiones sociocomunitaria e institucional".

## Added

- Sección 6.1 "Metodología de desarrollo" y tabla de adaptación de los elementos de Scrum, con la Scrum Guide en la bibliografía.
- Tabla de clasificación de los indicadores por dimensión en el capítulo de viabilidad.
- Referencias a la página de participación electoral del SERVEL y al reporte comunal de la BCN.
- Tercer sub-indicador del módulo BCN en "Módulos implementados", con un registro de ejemplo.
- Caso del SERVEL en "Volatilidad de las fuentes web".
- Subsección "Participación Electoral" en resultados, filas de SCCP en las tablas de validación y de rendimiento, y el error del reporte comunal 2023 en validación.
- Párrafo de SCCP en la conclusión del primer objetivo y verificación de la hipótesis en las conclusiones generales.
- Párrafo de hallazgos en el resumen y en el abstract.
- Capturas `img_23` (API de participación) e `img_24` (pregunta de Metabase).

## Changed

- La tabla de cumplimiento agrega las columnas de meta y valor logrado y una fila para la arquitectura (CT).
- La fuente de SCCP en el capítulo de viabilidad pasa del CSV del SERVEL al reporte comunal de la BCN.
- La tabla de tipos de conexión suma `participacion-electoral` al `RequestPromiseAdapter`.
- Resumen, abstract, rendimiento y conclusiones cuentan indicadores del modelo CORE: cuatro implementados y 70 registros.
- El rango de tiempo en la obtención del documento remoto pasa de 88 %–93 % a 88 %–99 %.
- Conclusiones, calidad de las fuentes, limitaciones y trabajo futuro dejan solo SNP como indicador pendiente.
- La hipótesis se enuncia en forma afirmativa.
- El título cubre las dimensiones sociocomunitaria e institucional en la cabecera, los metadatos del PDF y la portada.
- La sección de pruebas informa 159 pruebas en 31 suites.
- Capturas `img_14` (catálogo de la API), `img_18` (dashboard) e `img_21` (pregunta de pobreza) actualizadas.
- Se eliminan los `TODO` de la plantilla en el resumen y el abstract.
- El PDF se recompila tras cada cambio.

## Files of interest

- `docs/tesis/tesis.tex`
- `docs/tesis/referencias.bib`
- `docs/tesis/img/`
- `docs/tesis/tesis.pdf`

## Commits

- `9aee124` — docs(thesis): add scrum guide bibliography entry
- `df1aa1e` — docs(thesis): describe scrum-based methodology and revise objectives table
- `ae534b1` — docs(thesis): rebuild pdf
- `7d26649` — docs(thesis): add electoral participation screenshots
- `cc0c66e` — docs(thesis): refresh metabase dashboard and poverty rate screenshots
- `9d6d5cb` — docs(thesis): add servel participation and bcn electoral report references
- `9062669` — docs(thesis): classify indicators by dimension and move sccp source to bcn
- `b791942` — docs(thesis): rebuild pdf
- `a2427de` — docs(thesis): describe electoral participation sub-indicator and servel source change
- `7cb3a6c` — docs(thesis): rebuild pdf
- `7abecac` — docs(thesis): report electoral participation results, validation and timing
- `a01d199` — docs(thesis): rebuild pdf
- `89be7d5` — docs(thesis): update conclusions, limitations and test count for electoral participation
- `49ea1fd` — docs(thesis): rebuild pdf
- `f14860c` — docs(thesis): count core indicators and update abstracts with electoral participation
- `85b9ed3` — docs(thesis): rebuild pdf
- `9d6c8dd` — docs(thesis): retitle to both dimensions, state hypothesis and ground scrum table
- `d52beea` — docs(thesis): rebuild pdf
