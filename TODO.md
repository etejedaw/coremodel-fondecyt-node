# TODO

## Fase 1: Diagnóstico, ajustes de arquitectura y migración de legacy

- [x] Analizar y ajustar el patrón factory, modularización y separación de responsabilidades.
- [x] Identificar duplicaciones o problemas de acoplamiento.
- [x] Documentar decisiones y dibujar un pequeño diagrama de módulos (puede ser solo en texto al principio).
- [x] Revisa el código en helpers/scraper y planifica cómo integrarlo a la arquitectura nueva.
- [x] Si algún scraper legacy no encaja, prioriza refactor sobre "trasladar tal cual".

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

## Fase 5: Implementación de indicadores pendientes (OE1 + OE2)

### Population Poverty (PP) - Fuentes adicionales
- [ ] Módulo DataSocial: Descarga y normalización de archivos XLSX del Ministerio de Desarrollo Social (segmentación regional)
- [ ] Módulo CASEN: Descarga y normalización de archivos XLS de Observatorio Social, Casen 2017 (segmentación ciudadana)
- [ ] Módulo INE Censo: Descarga y normalización de archivos CSV del Censo de Población y Vivienda 2017 (segmentación regional y ciudadana)
- [ ] Generalizar el módulo BCN tasa-pobreza-ingresos para soportar múltiples comunas (actualmente solo Valdivia)

### Social Capital - Civic Participation (SCCP)
- [ ] Módulo Servel: Descarga y normalización de archivos CSV del Registro Electoral (porcentaje de participación cívica, segmentación regional)
- [ ] Crear sub-módulo en BCN o módulo independiente para participación cívica

### Social Capital - Civic Organizations (SCCO)
- [ ] Generalizar el módulo BCN organizaciones-comunitarias para soportar múltiples comunas (actualmente solo Valdivia)

### Special Needs Population (SNP)
- [ ] Módulo CASEN SNP: Descarga y normalización de datos de discapacidad desde Observatorio Social (XLS/SAV)
- [ ] Módulo INE SNP: Descarga y normalización de datos de discapacidad desde INE (SAV/DAT)
- [ ] Módulo BCN SNP: Scraping de datos de población con necesidades especiales desde BCN (tabla HTML)

### Tsunami Drills (TD) - Ampliación
- [ ] Módulo ONEMI: Scraping de simulacros desde la web de ONEMI (tabla HTML, incluye simulacros de aluviones y erupciones - requiere filtrado)
- [ ] Evaluar agregar más años de simulacros del MINEDUC si están disponibles

### Social Capital - Emergency Organizations (SCEO)
- [ ] Investigar fuentes de datos municipales para voluntarios en organizaciones de emergencia
- [ ] Documentar como indicador sin fuente accesible si no se encuentra data

## Fase 6: API y analíticas (OE3)

- [ ] Crear endpoints API para los nuevos módulos implementados en Fase 5
- [ ] Endpoint de resumen: listar todos los módulos e indicadores disponibles con su estado
- [ ] Endpoint de consulta: permitir consultar datos por comuna, región y periodo de tiempo
- [ ] Endpoint de exportación CSV para cada indicador
- [ ] Documentar la API (endpoints disponibles, parámetros, respuestas de ejemplo)

## Fase 7: Testing y validación

- [ ] Tests unitarios para cada ParseAdapter (verificar que extrae correctamente la data)
- [ ] Tests unitarios para cada MapperAdapter (verificar transformación de datos)
- [ ] Tests unitarios para cada HashAdapter (verificar unicidad de keys)
- [ ] Tests de integración: flujo completo ETL por módulo (fetch → parse → map → hash → save)
- [ ] Validar datos extraídos vs datos manuales del equipo de investigación

## Fase 8: Redacción de la tesis (documento escrito)

### Capítulos por escribir/actualizar
- [ ] **Cap. 4 - Herramientas de desarrollo**: Actualizar stack tecnológico (agregar Puppeteer, Zod, Docker; actualizar versiones; mencionar cambio de `request` por `request-promise`)
- [ ] **Cap. 5 - Diseño de prototipo**: Actualizar para reflejar la arquitectura modular final (ya no es un prototipo simple; describir patrones factory, adapter, builder)
- [ ] **Cap. 6 - Desarrollo e implementación** (nuevo): Describir la arquitectura modular, el flujo ETL con adapters, el IndicatorBuilder, ScraperFactory, ScrapeBase. Incluir diagramas de clases y secuencia
- [ ] **Cap. 7 - Resultados** (nuevo): Mostrar datos extraídos por cada módulo, screenshots de la API, comparación con extracción manual, métricas de rendimiento
- [ ] **Cap. 8 - Conclusiones** (nuevo): Evaluación de cumplimiento de objetivos (OE1, OE2, OE3), limitaciones encontradas (SCEO sin fuente, Statista de pago, dependencia de municipalidades), trabajo futuro (más indicadores, frontend Angular, deploy productivo)
- [ ] **Bibliografía**: Actualizar con nuevas referencias técnicas y académicas utilizadas

### Diagramas y material visual
- [ ] Diagrama de arquitectura general del sistema (módulos, core, adapters)
- [ ] Diagrama de clases (ScrapeBase, ScraperFactory, IndicatorBuilder, Adapters)
- [ ] Diagrama de secuencia del flujo ETL
- [ ] Capturas de pantalla de la API funcionando
- [ ] Tablas comparativas: datos extraídos vs datos de referencia

### Revisión general del documento
- [ ] Revisar consistencia de terminología (ETL, web scraping, scraping vs scrapping)
- [ ] Verificar que los 3 objetivos específicos estén cubiertos en resultados y conclusiones
- [ ] Agregar anexos con ejemplos de datos extraídos y código relevante
