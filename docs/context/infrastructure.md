# Infraestructura

Servicios de Docker Compose, inicialización de MongoDB, aprovisionamiento de Metabase y variables de entorno. Para los pasos de instalación y arranque en local, ver el [README](../../README.md).

Este documento explica el mecanismo y apunta al archivo que guarda cada valor. Puertos, credenciales e imágenes se leen en `docker-compose.yml`, `.env.example` y `.docker/metabase/provisioning.json`.

## Servicios

Definidos en `docker-compose.yml`. La API (Node) no es un servicio de Compose: se corre en el host con `npm run dev`. Existe un `Dockerfile` multi-etapa para construir la imagen de la API, pero Compose no lo usa.

| Servicio | Para qué sirve |
|---|---|
| `mongo` | Base de datos donde la API guarda los registros extraídos y los resultados calculados. Ejecuta los scripts de `.docker/mongo/` en su primer arranque |
| `mongo-express` | Interfaz web para inspeccionar MongoDB. Solo para desarrollo |
| `metabase` | Dashboards sobre las colecciones de MongoDB |
| `metabase-provision` | Contenedor de un solo uso (`restart: "no"`). Espera a Metabase, le aplica `provisioning.json` y termina |

Los puertos publicados en el host se pueden cambiar con `DB_PORT`, `MONGO_EXPRESS_PORT` y `METABASE_PORT`, que Compose lee del `.env` con un valor por defecto en el propio `docker-compose.yml`.

`metabase-provision` monta `.docker/metabase/` en solo lectura y ejecuta `provision.mjs` con `node:22-alpine`. Habla con Metabase por la red interna (`MB_URL=http://metabase:3000`), no por el puerto publicado. Corre en cada `docker compose up`.

## Inicialización de MongoDB

`.docker/mongo/init.js` se monta en `/docker-entrypoint-initdb.d`. La imagen de MongoDB ejecuta ese directorio solo cuando el directorio de datos está vacío, es decir, en el primer arranque. El script crea las colecciones vacías de la base `test`: las de cada indicador y `indicator-results`.

Existe porque Metabase valida que la base de datos exista antes de registrarla como fuente. MongoDB solo crea una base al insertar el primer documento, así que sin colecciones previas la conexión se rechaza hasta que alguien pueble la base. Con las colecciones vacías el aprovisionamiento funciona desde el primer arranque.

La base se llama `test` porque la cadena de conexión de `src/config/database.config.ts` no indica base de datos y Mongoose usa ese valor por defecto. `provisioning.json` apunta a la misma base.

Si agregas un indicador con una colección nueva, agrégala también a la lista de `init.js`. Solo tiene efecto en un volumen vacío: sobre una base existente la colección aparece sola al primer `insertMany`.

## Aprovisionamiento de Metabase

`.docker/metabase/provision.mjs` configura Metabase por su API REST a partir de `.docker/metabase/provisioning.json`. El JSON es la fuente de verdad: el script no tiene valores propios salvo las credenciales del administrador.

### Qué hace, en orden

1. Espera a que `/api/health` responda `ok` (hasta 60 intentos cada 5 s).
2. Si la instancia no tiene usuario, ejecuta el setup inicial: crea la cuenta administradora, el nombre del sitio y el idioma. Si ya tiene, inicia sesión con las credenciales configuradas.
3. Elimina la base de datos de ejemplo y archiva todo dashboard cuyo nombre no sea el declarado en `provisioning.json`.
4. Busca la base por nombre y, si no existe, la conecta con los datos de `database` (hasta 5 intentos).
5. Fuerza un `sync_schema` y espera a que Metabase detecte tablas. Si no aparecen (base sin datos), avisa y sigue.
6. Crea o actualiza cada question de `cards`.
7. Crea o actualiza el dashboard y reemplaza sus tarjetas por las de `cards`, con la posición de `layout`.

### Idempotencia

Cada paso consulta antes de escribir. La base y el dashboard se buscan por nombre; las questions, por nombre dentro de las existentes. Lo que existe se actualiza (`PUT`) y lo que no se crea (`POST`), así que ejecutarlo varias veces converge al mismo estado.

Consecuencias a tener en cuenta:

- La identidad de una question es su `name`. Si lo cambias en el JSON se crea una question nueva y la anterior queda en Metabase.
- Quitar una entrada de `cards` la saca del dashboard, pero no borra la question.
- El paso 3 archiva cualquier dashboard con otro nombre, también los que alguien creó a mano en la UI.
- Si la instancia ya tiene usuario y las credenciales del script no coinciden, el inicio de sesión falla y el script termina con error.

### Credenciales y URL

El script lee `MB_URL`, `MB_ADMIN_EMAIL`, `MB_ADMIN_PASSWORD`, `MB_ADMIN_FIRST_NAME` y `MB_ADMIN_LAST_NAME`. Los valores por defecto están al comienzo de `provision.mjs`. La conexión a MongoDB (host, usuario, contraseña, base) está en la clave `database` de `provisioning.json`, y debe coincidir con `docker-compose.yml`. El host es `mongo` y no `localhost` porque Metabase se conecta desde dentro de la red de Docker.

### Cómo re-ejecutarlo

Dentro de Docker, con el entorno levantado:

```bash
docker compose up metabase-provision
```

Fuera de Docker, apuntando al puerto publicado (requiere Node 22, por el `fetch` global y el `await` de nivel superior):

```bash
MB_URL=http://localhost:3001 node .docker/metabase/provision.mjs
```

### Agregar una question

1. Añade una entrada al arreglo `cards` de `provisioning.json`. Copia la forma de una existente: `name`, `description`, `collection` (la colección de MongoDB), `display`, `query`, `visualization_settings` y `layout`.
2. `query` es un pipeline de agregación de MongoDB. El script lo serializa como consulta nativa sobre la colección indicada.
3. `layout` ubica la tarjeta en la grilla del dashboard (`col`, `row`, `size_x`, `size_y`). Revisa que no se solape con las demás.
4. Re-ejecuta el aprovisionamiento.

Las questions concretas viven en `provisioning.json`. Por qué algunas agrupan por `region` y por qué una recalcula el total de organizaciones comunitarias se explica en [data.md](./data.md).

Las queries leen las colecciones en vivo: no necesitan ajustes cuando llegan datos nuevos.

## Qué conserva cada comando

Ni `mongo` ni `metabase` declaran volúmenes en `docker-compose.yml`. Los datos viven en el sistema de archivos del contenedor (en el caso de MongoDB, en el volumen anónimo que declara su imagen).

| Comando | MongoDB | Metabase |
|---|---|---|
| `docker compose stop` / `start` | Conserva los datos | Conserva la configuración |
| `docker compose down` | Pierde los datos: el contenedor nuevo parte con un volumen vacío y `init.js` vuelve a ejecutarse | Pierde la configuración: el siguiente `up` ejecuta el setup completo de nuevo |
| `docker compose down -v` | Además elimina el volumen anónimo que queda huérfano | Igual que `down` |

Tras un `down` hay que volver a poblar la base con los `POST` de extracción. El aprovisionamiento recrea Metabase por sí solo.

## Variables de entorno

`.env.example` lista las variables y las deja vacías. Se copia a `.env` (ignorado por git).

| Quién las lee | Variables | Dónde se definen sus defaults |
|---|---|---|
| La API (Node) | `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `NODE_ENV` | Esquema zod de `src/config/environment.config.ts` |
| Docker Compose | `DB_PORT`, `MONGO_EXPRESS_PORT`, `METABASE_PORT` | Sintaxis `${VAR:-default}` en `docker-compose.yml` |
| `provision.mjs` | `MB_URL`, `MB_ADMIN_EMAIL`, `MB_ADMIN_PASSWORD`, `MB_ADMIN_FIRST_NAME`, `MB_ADMIN_LAST_NAME` | Constantes al inicio de `provision.mjs`; no están en `.env.example` |

Detalles:

- Los defaults de la API coinciden con las credenciales fijas de `mongo` en `docker-compose.yml`, por eso en local no hace falta editar nada.
- `NODE_ENV` define el nivel del logger (ver [architecture.md](../architecture.md#componentes-del-core)).
- Los scripts `dev` y `start` cargan el `.env` con `--env-file-if-exists`; si no existe, se usan los defaults del esquema zod. `npm test` no lo carga.
- Una variable definida como vacía no usa el default del esquema zod (`""` no es `undefined`). Si copias `.env.example` a `.env` sin completarlo, la API recibe cadenas vacías: dale valor a las variables que dejes o bórralas.
