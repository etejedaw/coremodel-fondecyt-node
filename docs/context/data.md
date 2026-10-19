# Datos

De dónde salen los datos, cómo quedan guardados en MongoDB y cómo se normalizan las regiones. Cómo se obtienen y procesan está en [modules.md](./modules.md). Los endpoints están en [../api/](../api/).

## Fuentes

Hay dos fuentes, cada una con su módulo. La URL y la frecuencia de cada indicador están en el `config.ts` del módulo.

### MINEDUC: simulacros de tsunami (vía Wayback Machine)

Módulo `emergencias-desastres`, tres indicadores (`simulacros-2021`, `simulacros-2022`, `simulacros-2023`).

- **Qué entrega.** Una página HTML con una tarjeta por simulacro: día, mes, año, tipo de lugar y el territorio donde ocurrió.
- **Formato.** HTML. El parse lee las tarjetas con selectores CSS (cheerio).
- **Instantánea.** El sitio original del MINEDUC ya no sirve estas páginas, así que la URL apunta a una captura de Wayback Machine con fecha fija. Una captura no cambia, por eso los tres indicadores usan `FREQUENCIES.once`: `CronRegistry` no los programa y solo se ejecutan al llamar el `POST` del indicador.
- **Meses en español abreviado.** La fuente entrega el mes como `Ene`, `Feb`, `Mar`, etc. El mapper los traduce a número con una tabla fija. Un mes que no esté en la tabla produce una fecha inválida.
- **Territorio sin convención.** El campo de región mezcla grafías, prefijos y sufijos. Se normaliza con `regions.ts` (ver más abajo).

### BCN: pobreza, participación electoral y organizaciones comunitarias

Módulo `biblioteca-congreso-nacional`, tres indicadores de la comuna de Valdivia, todos con frecuencia anual.

**`valdivia-tasa-pobreza-ingresos`**

- **Qué entrega.** El reporte comunal de la BCN en HTML. El parse busca la sección *2.1 Tasa de Pobreza por ingresos* y lee su tabla: una fila por unidad territorial (por ejemplo, la comuna y su región) con una tasa por cada medición CASEN que informe el reporte. Cada reporte informa mediciones distintas (el de 2023 trae CASEN 2017 y 2020; los de 2024 y 2025, CASEN 2017 y 2022), así que el parse lee los años desde los encabezados de la tabla y nombra cada campo `casen<año>`. Se guarda una fila por unidad territorial y año consultado.
- **Parámetro.** La URL lleva `{{year}}` (año del reporte). Se pasa con `?year=YYYY` en el `POST`; el cron anual pide el año actual y, si el reporte todavía no está publicado, los dos anteriores (ver [modules.md](./modules.md#parámetros-param-en-la-url)). El año queda guardado en cada registro como `year`.
- **Decimales con coma.** Los valores vienen como `12,5`. El mapper cambia la coma por punto antes de convertir a número.
- **Dependencia del HTML.** El parse depende del título de la sección. Si la BCN lo cambia, el parse devuelve una lista vacía y el pipeline falla con `ParseError`.

**`valdivia-participacion-electoral`**

- **Qué entrega.** El mismo reporte comunal que la tasa de pobreza, sección *Indicadores electorales*, que la BCN arma con datos del SERVEL. El parse lee cada tabla cuyo título sea de participación (`participación (%)`): una fila por unidad territorial (comuna, región y país) con inscritos, votantes y porcentaje de participación. El nombre de la elección se toma del título de la tabla, desde lo que sigue a "participación (%)". Se guarda una fila por unidad territorial y elección.
- **Una elección por reporte.** Cada reporte informa la elección más reciente a su fecha: los de 2020 y 2021 la presidencial 2017, el de 2023 el plebiscito 2022, el de 2024 el plebiscito 2023, el de 2025 las municipales 2024 (titulada "Padrón definitivo 2024") y el de 2026 las generales 2025 y la segunda vuelta. Un año sin reporte (por ejemplo `2022`) devuelve el reporte más reciente. Por eso la `key` usa la elección y no el año consultado.
- **Encabezados variables.** Las columnas cambian de nombre entre reportes ("Inscritos Total" o "N° Electores", "Votación" o "N° Votantes") y algunos agregan "Mesas Total". El parse las reconoce por su encabezado y descarta las que no usa.
- **Participación propia y de la fuente.** `participacionFuente` es el porcentaje publicado; `participacion` lo calcula el mapper como votantes sobre inscritos. Ambos se redondean a dos decimales, porque la fuente publica valores como `83,4000000000000057`. Los conteos vienen con punto de miles (`147.528`).
- **Dato erróneo en la fuente.** El reporte 2023 informa para Valdivia 23.008 inscritos y 91,5 % de participación, cuando la comuna tiene unos 145 mil inscritos. Se guarda como viene.
- **Por qué no el SERVEL directo.** El SERVEL ya no publica la participación en CSV: su sitio la muestra solo en tableros Power BI.

**`valdivia-organizaciones-comunitarias`**

- **Qué entrega.** Un JSON descargable de las estadísticas territoriales de la BCN. El parse toma la lista bajo la clave `datosTemaN`: un registro por año con la cantidad de cada tipo de organización (juntas de vecinos, clubes deportivos, centros de madres, etc.).
- **Valores como texto.** Los números llegan como `string`. El mapper los convierte y usa `0` cuando el valor no es numérico o falta.
- **Suma total no confiable.** La BCN no informa el campo de suma total de organizaciones en todos los años; el mapper lo deja en `0` cuando falta. Por eso las visualizaciones que necesitan el total lo recalculan sumando los tipos individuales, no con ese campo (ver [infrastructure.md](./infrastructure.md) para las questions de Metabase).

### Volatilidad

Las tres fuentes son sitios web de terceros sin contrato: pueden cambiar su HTML, mover una URL o retirar una página. El caso del MINEDUC es el ejemplo: la fuente original dejó de estar disponible y hubo que recurrir a Wayback Machine, que tampoco archiva todo ni con la misma frecuencia. Los parse adapters son los puntos que se rompen primero. Ver la sección *Volatilidad de las fuentes web* de la tesis.

## Colecciones MongoDB

Hay una colección por tipo de dato más una para los resultados calculados. El nombre de cada una lo deriva Mongoose del nombre del modelo en su `schema.ts`, y los campos están definidos allí: no se repiten en este documento.

| Colección | Módulo | Qué guarda | Clave única |
|---|---|---|---|
| `emergencia-desastres` | `emergencias-desastres` | Un documento por simulacro: fecha, tipo de lugar, región normalizada y región original. | `key` (fecha y región) |
| `tasa-pobreza-ingresos` | `biblioteca-congreso-nacional` | Un documento por unidad territorial y año consultado con la tasa CASEN de cada medición. | `key` (unidad territorial, año) |
| `participacion-electoral` | `biblioteca-congreso-nacional` | Un documento por unidad territorial y elección con inscritos, votantes y participación. | `key` (unidad territorial, elección) |
| `organizaciones-comunitarias` | `biblioteca-congreso-nacional` | Un documento por año con la cantidad de cada tipo de organización. | `key` (año) |
| `indicator-results` | `emergencias-desastres` | Resultados agregados del calculator. | No tiene `key`: se deduplica comparando con el último. |

Todos los documentos de las colecciones de datos llevan además `indicator` y `module`, que agrega `ScrapeBase.init` antes de guardar, y `createdAt`/`updatedAt` de Mongoose (`timestamps: true`). Los schemas de la BCN usan `strict: false`, así que guardan esos campos aunque no estén declarados. Las lecturas (`find` del storage) excluyen `_id` y `__v`.

La `key` es única por colección, no por indicador. Cómo se calcula en cada módulo está en [modules.md](./modules.md).

### `indicator-results`

Guarda lo que calcula un `CalculatorAdapter`. Hoy solo lo usa `emergencias-desastres` (`TsunamiDrillsCalculatorAdapter`), que calcula por indicador el total de simulacros y la cantidad por región.

- Cada documento lleva `indicator` y `module`, el resultado y las marcas de tiempo.
- La colección es un historial de cambios, no un registro de ejecuciones: solo guarda un resultado cuando cambia (ver [modules.md](./modules.md#resultados-del-calculator)).
- `calculator.find` devuelve el más reciente (orden por `createdAt` descendente) sin `_id`, `__v` ni marcas de tiempo. Es lo que responde `GET /emergencia-desastres/:indicator/result`.
- Como el cálculo agrupa por `region`, depende de que la normalización haya unificado las grafías.

## Normalización de regiones

Código en `src/modules/emergencias-desastres/regions.ts`, que usa el mapper de `emergencias-desastres`.

- **`region`.** Nombre canónico de la región (una de las dieciséis). Es el campo por el que se agrupa y se cuenta.
- **`regionSource`.** El texto original de la fuente, sin tocar. Sirve para auditar la normalización y para detectar grafías nuevas.

Cómo se normaliza: el texto se pasa a minúsculas, sin diacríticos ni signos, y se busca como subcadena contra una lista de patrones, uno por región. Los prefijos y sufijos que agrega la fuente (por ejemplo "Región de" o "- Provincia de ...") no impiden la coincidencia.

Si ningún patrón coincide, `region` conserva el texto original recortado y se registra un `warn` con el valor crudo. El registro se guarda igual: es preferible arrastrar una grafía sin normalizar que perder el dato, y el log permite detectar cuando la fuente introduce un territorio nuevo. Un territorio sin normalizar aparece como una región más al agregar, así que conviene revisar el log tras cada ejecución.

Para agregar una grafía o región nueva se edita la lista de patrones de `regions.ts` y su test (`test/modules/emergencias-desastres/regions.test.ts`).

Para el porqué de normalizar y de conservar el dato original, ver la sección *Normalización de unidades territoriales* de la tesis.

La BCN no pasa por esta normalización: `tasa-pobreza-ingresos` y `participacion-electoral` guardan la unidad territorial tal como viene.
