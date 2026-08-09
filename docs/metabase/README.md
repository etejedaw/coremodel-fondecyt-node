# Configuración de Metabase

## 1. Levantar Metabase

```bash
docker compose up metabase -d
```

Esperar unos minutos a que inicie. Acceder a `http://localhost:3001`.

## 2. Configuración inicial

- Crear cuenta de administrador
- Seleccionar idioma

## 3. Conectar MongoDB

En la pantalla de agregar base de datos:

| Campo | Valor |
|-------|-------|
| Tipo | MongoDB |
| Nombre | FONDECYT CORE |
| Host | mongo |
| Puerto | 27017 |
| Nombre de base de datos | test |
| Usuario | root |
| Contraseña | toor |
| Authentication database | admin |

El host es `mongo` (no `localhost`) porque Metabase se conecta dentro de la red de Docker.

## 4. Colecciones disponibles

| Colección | Contenido |
|-----------|-----------|
| `emergencia-desastres` | Simulacros por fecha y región (2021-2023) |
| `tasa-pobreza-ingresos` | Tasa de pobreza CASEN 2017/2022 por unidad territorial |
| `organizaciones-comunitarias` | Organizaciones comunitarias por tipo y año (2008-2024) |
| `indicator-results` | Resultados calculados (totalDrills, drillsByRegion) |

## 5. Queries sugeridas para dashboards

### Simulacros por año

- Colección: `indicator-results`
- Filtro: module = "emergencia-desastres"
- Mostrar: totalDrills agrupado por indicator
- Tipo de gráfico: barras

### Simulacros por región (2021)

- Colección: `emergencia-desastres`
- Filtro: indicator = "simulacros-2021"
- Agrupar por: region
- Contar registros
- Tipo de gráfico: barras horizontales o mapa

Agrupar por `region` y no por `regionSource`: la fuente nombra la misma región
de formas distintas según el año (`Aysén` y `Aysén- Cochrane`, `O'Higgins` y
`O´Higgins`), por lo que `regionSource` partiría una región en varias barras.
El campo `regionSource` conserva el texto original para auditar la extracción.

### Simulacros por región, acumulado 2021-2023

- Colección: `emergencia-desastres`
- Sin filtro de indicador
- Agrupar por: region
- Contar registros
- Tipo de gráfico: mapa de Chile o barras horizontales

### Evolución de pobreza por territorio

- Colección: `tasa-pobreza-ingresos`
- Columnas: unidadTerritorial, casen2017, casen2022
- Tipo de gráfico: barras agrupadas (comparar 2017 vs 2022)

### Organizaciones comunitarias en el tiempo

- Colección: `organizaciones-comunitarias`
- Eje X: anio
- Eje Y: nDeOrganizacionesComunitariasSumaTotal
- Tipo de gráfico: línea temporal

### Detalle de organizaciones por tipo

- Colección: `organizaciones-comunitarias`
- Filtro: anio = 2024 (o el más reciente)
- Columnas: nDeJuntasDeVecinos, nDeClubesDeportivos, nCentrosCulturales, etc.
- Tipo de gráfico: torta o barras
