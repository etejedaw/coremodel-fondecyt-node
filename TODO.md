# TODO

## Fase 1: Diagnóstico, ajustes de arquitectura y migración de legacy

- [x] Analizar y ajustar el patrón factory, modularización y separación de responsabilidades.
- [x] Identificar duplicaciones o problemas de acoplamiento.
- [x] Documentar decisiones y dibujar un pequeño diagrama de módulos (puede ser solo en texto al principio).
- [x] Revisa el código en helpers/scraper y planifica cómo integrarlo a la arquitectura nueva.
- [x] Si algún scraper legacy no encaja, prioriza refactor sobre “trasladar tal cual”.

## Fase 2: Integración de fuentes y robustez del ETL

- [x] Hacer foco en la automatizar para descargar archivos csv/xlsx y normalizarlos.
- [x] Si alguna fuente requiere scraping complejo o el html cambió drásticamente, documentarlo como un caso especial.

## Fase 3: Modelos de datos, exportación y API

- [x] Asegurar que los datos extraídos son guardados de forma homogénea en MongoDB.
- [x] Validar que los datos extraídos no sean guardados en caso de ya existir
- [x] Validar en caso de que el scrape falle o no encuentre datos

## Fase 4: Automatización, robustez y preparación para producción

- [x] Definir enum FREQUENCIES con representación en cron
- [x] Permitir usar strings como "year" o el cron directamente
- [ ] Crear una clase/servicio CronRegistry
- [ ] Definir estructura común para los errores
- [ ] Crear un Logger común
