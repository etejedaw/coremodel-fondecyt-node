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
- [x] Crear una clase/servicio CronRegistry
- [x] Definir estructura común para los errores
- [x] Crear un Logger común

## Fase 5: Implementación de indicadores (OE1 + OE2)

Los módulos implementados demuestran los distintos tipos de conexión que soporta la arquitectura:
- **HTML scraping** (RequestPromiseAdapter + Cheerio) → emergencias-desastres
- **HTML table scraping** (RequestPromiseAdapter + Cheerio) → BCN tasa-pobreza-ingresos
- **JSON API** (JsonFetchAdapter) → BCN organizaciones-comunitarias
- **JS-rendered pages** (PuppeteerAdapter) → Disponible en core
- **Descarga de archivos** (DownloadAdapter) → Disponible en core

### Tsunami Drills (TD)
- [x] Módulo emergencias-desastres: Scraping de simulacros 2021/2022/2023 desde MINEDUC (vía Wayback Machine, los links originales ya no existen)
- [x] ParseAdapter con Cheerio para extracción de fechas y lugares
- [x] Mapper, Hash (slug date-city), StorageAdapter con manejo de duplicados
- [x] Endpoint API: `GET /emergencia-desastres` y `GET /emergencia-desastres/:indicator`

### Population Poverty (PP)
- [x] Sub-módulo BCN tasa-pobreza-ingresos: Scraping de tabla HTML desde BCN (Valdivia como caso demostrativo)
- [x] Endpoint API: `GET /biblioteca-congreso-nacional/valdivia-tasa-pobreza-ingresos?year=YYYY`

### Social Capital - Civic Organizations (SCCO)
- [x] Sub-módulo BCN organizaciones-comunitarias: Extracción de JSON API desde BCN (Valdivia como caso demostrativo)
- [x] Endpoint API: `GET /biblioteca-congreso-nacional/valdivia-organizaciones-comunitarias`

### Indicadores documentados como limitación
- **SCEO (Emergency Organizations)**: Sin fuente de datos pública identificada; depende de datos municipales no accesibles
- **SCCP (Civic Participation)**: Fuente identificada (Servel, CSV) pero no implementada — candidato a trabajo futuro
- **SNP (Special Needs Population)**: Fuentes identificadas (CASEN, INE, BCN) pero no implementadas — candidato a trabajo futuro

## Fase 6: API y analíticas (OE3)

- [x] Endpoint API para emergencias-desastres (listar indicadores + ejecutar scrape)
- [x] Endpoint API para biblioteca-congreso-nacional (listar indicadores + ejecutar scrape con parámetro year)
- [x] Endpoint de resumen: `GET /` lista todos los módulos con sus indicadores (name, url, frequency)
- [x] Documentar la API con colección Bruno OpenCollection YAML en `docs/api/`

## Fase 7: Testing y validación

- [x] Tests unitarios para cada ParseAdapter (verificar que extrae correctamente la data)
- [x] Tests unitarios para cada MapperAdapter (verificar transformación de datos)
- [x] Tests unitarios para cada HashAdapter (verificar unicidad de keys)
- [x] Tests de integración: flujo completo ETL por módulo (parse → map → hash con datos realistas)
- [x] Validar datos extraídos vs datos manuales de referencia (formato decimal chileno, nombres territoriales, fechas)

## Fase 8: Capa de cálculo de indicadores CORE

- [x] Crear `CalculatorAdapter` abstracto en `core/adapters/` (agrega múltiples registros en un valor final)
- [x] Agregar `setCalculatorAdapter()` como opcional en el `IndicatorBuilder`
- [x] Integrar el paso de cálculo en `ScrapeBase.init()` (después del save, si existe calculator)
- [x] Implementar cálculo para Tsunami Drills: totalDrills + drillsByCity
- [x] Respuesta del endpoint incluye `calculated` automáticamente si el indicador tiene calculator

## Fase 9: Visualización y analíticas con Metabase

- [x] Agregar Metabase al `docker-compose.yml` con volumen persistente para su base de datos interna
- [ ] Conectar Metabase a MongoDB como fuente de datos (ver `docs/metabase/setup.md`)
- [ ] Crear y guardar queries por cada colección (simulacros, pobreza, organizaciones comunitarias)
- [ ] Configurar dashboards con gráficos por indicador (se actualizan automáticamente al poblar MongoDB via CronRegistry)

## Fase 10: Redacción de la tesis (documento escrito)

### Capítulos por escribir/actualizar

- [ ] **Cap. 4 - Herramientas de desarrollo**: Actualizar stack tecnológico (agregar Puppeteer, Zod, Docker; actualizar versiones; mencionar cambio de `request` por `request-promise`)
- [ ] **Cap. 5 - Diseño de prototipo**: Actualizar para reflejar la arquitectura modular final (ya no es un prototipo simple; describir patrones factory, adapter, builder)
- [ ] **Cap. 6 - Desarrollo e implementación** (nuevo): Describir la arquitectura modular, el flujo ETL con adapters, el IndicatorBuilder, ScraperFactory, ScrapeBase. Incluir diagramas de clases y secuencia
- [ ] **Cap. 7 - Resultados** (nuevo): Mostrar datos extraídos por cada módulo, screenshots de la API, comparación con extracción manual, métricas de rendimiento
- [ ] **Cap. 8 - Conclusiones** (nuevo): Evaluación de cumplimiento de objetivos (OE1, OE2, OE3), limitaciones (SCEO sin fuente, links de MINEDUC caídos, Statista de pago, dependencia de municipalidades), trabajo futuro (más indicadores con PuppeteerAdapter/DownloadAdapter, frontend Angular, deploy productivo)
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
