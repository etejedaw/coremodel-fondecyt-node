# Módulo BCN y pipeline completo de adaptadores

**Released:** 2025-07-20

## Summary

El ciclo de un indicador deja de terminar en el parse y pasa a cubrir el recorrido completo hasta MongoDB. Ahora `ScrapeBase.init` ejecuta fetch, parse, mapper, hash y storage: los registros parseados se transforman con un `MapperAdapter`, se etiquetan con el módulo y el indicador, reciben una clave única generada por un `HashAdapter` y se persisten con un `StorageAdapter`. Con este pipeline se agrega el módulo `biblioteca-congreso-nacional`, con los indicadores de organizaciones comunitarias y de tasa de pobreza por ingresos, y dos nuevos `FetchAdapter`: uno que descarga archivos a `/tmp` y otro que obtiene JSON. El código legacy que quedaba se aísla en `src/legacy` y después se elimina.

## Highlights

- `init(indicator, params)` ejecuta fetch → parse → mapper → hash → storage y admite parámetros en la URL.
- Adaptadores abstractos `StorageAdapter`, `MapperAdapter` y `HashAdapter` en `src/core/adapters`.
- `DownloadAdapter` y `JsonFetchAdapter` como nuevas estrategias de fetch.
- Módulo `biblioteca-congreso-nacional` con `organizaciones-comunitarias` y `tasa-pobreza-ingresos`, y su ruta en la API.

## Added

- `src/core/adapters/fetch-adapter/DownloadAdapter.ts` y `JsonFetchAdapter.ts`.
- `src/core/adapters/storage-adapter/StorageAdapter.ts`, `mapper-adapter/MapperAdapter.ts` y `hash-adapter/HashAdapter.ts`.
- Objeto `metadata` en `IndicatorBuilder` para guardar campos adicionales del indicador.
- Módulo `src/modules/biblioteca-congreso-nacional`, con una carpeta por indicador que contiene `parse-adapter`, `mapper`, `schema`, `storage-adapter`, `hash` e `interfaces`.
- Ruta `src/api/routes/biblioteca-congreso-nacional.route.ts`.
- Validaciones en `ScraperFactory` y error explícito cuando a un indicador le falta un adaptador.
- Dependencia `slug`.

## Changed

- `ScrapeBase.init` recibe parámetros opcionales para la URL y añade `module` e `indicator` a cada registro antes de generar la clave y guardarlo.
- La función de mapeo `MapperFunction` se reemplaza por la clase abstracta `MapperAdapter`.
- `ParseAdapter` usa por defecto un arreglo de registros como tipo genérico.
- Convención de nombres en kebab-case para archivos de módulos y configuración (`config.ts`, `index.ts`, `parse-adapter.ts`, `database.config.ts`, `environment.config.ts`).
- `IndicatorBuilder` pasa de `src/core/utils/` a `src/core/`.
- README actualizado.

## Removed

- `src/helpers` (helpers de scraping legacy, `downloadFile` y el logger Winston), primero movido a `src/legacy` y después eliminado junto con sus tests.
- El atributo `version` de `docker-compose.yml`.

## Migration

- Cada indicador declara en su `config.ts`, además de fetch y parse, un `MapperAdapter`, un `HashAdapter` y un `StorageAdapter`. Si falta alguno, `init` falla.

## Files of interest

- `src/core/ScrapeBase.ts`
- `src/core/IndicatorBuilder.ts`
- `src/core/adapters/storage-adapter/StorageAdapter.ts`
- `src/core/adapters/hash-adapter/HashAdapter.ts`
- `src/modules/biblioteca-congreso-nacional/config.ts`

## Commits

- `e1fd87b` — feat(core): create adapter to download files in tmp directory
- `6432eec` — chore(core): create metadata object to storage aditionals fields
- `4342073` — chore: rename directory to legacy code
- `5e57dff` — chore(core): add validations in Scrape Factory
- `d573fc6` — chore: move test into legacy code and exlude it into tsconfig
- `e72c61f` — chore: remove legacy code
- `ca90e9d` — style: rename data parser adapter class name
- `3670b0c` — chore(core): add custom parametes in url
- `25c1637` — feat(modules): create module to biblioteca del congreso nacional
- `87ddf74` — chore: add biblioteca congreso nacional factory
- `c4ef942` — style: add empty block in code
- `0170c54` — feat(core): create new fetch adapter to download json data by url
- `7cc058e` — chore(modules): add organizaciones comunitarias in biblioteca congreso nacional factory
- `7e9f39d` — chore: update README.md
- `bab27a9` — chore: update README.md
- `97df05c` — chore: add organizaciones comunitarias schema in biblioteca congreso nacional
- `cab8a98` — fix: add default array record generic in Parse Adapter
- `bca0b7e` — feat(core): create storage adapter
- `71eda72` — feat(core): create mapper function type
- `5de4664` — style(core): remove unused constructor in Scrape Factory
- `e62f0fb` — chore(core): add storage adapter and mapper function in Indicator Builder
- `c76b08a` — chore(core): add mapper and storage actions in init Scrape Base function
- `cfebc2a` — chore(modules): update biblioteca congreso nacional module with new mapper function and storage adapter
- `7b7e39d` — style: replace mapper data type in setMapperFunction
- `0dbc3e1` — chore(core): add module name in db
- `198ab56` — style(modules): rename files
- `4db5122` — feat(modules): create mapper, shcema and storage-adapter in tasa pobreza ingresos
- `0420260` — style(core): remove redundancy tpye in Indicator Builder
- `41902c5` — chore(modules): update valdivia-tasa-pobreza-ingresos builder in config file
- `5458016` — chore: replace mapperFunction to MapperAdapter abstract class
- `c112baf` — chore(modules): add interfaces in organizaciones-comunitarias
- `515f7d9` — chore(modules): add mapper and interface in tasa-pobreza-ingresos
- `9f6c1cd` — feat(core): create hash adapter to generate unique key
- `0053297` — chore(core): add hash adapter in Indicator builder
- `b899c10` — chore(core): add error in undefined adapters
- `afaf979` — chore(core): add hash adapter in init function
- `e5371be` — chore(modules): add custom hash function in modules
- `a13457c` — fix: remove version in docker-compose
- `5d27f62` — chore: add slug package
- `ea22230` — chore: move Indicator Builder path
- `990be2f` — chore: update README.md
