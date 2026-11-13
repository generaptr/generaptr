# Changelog

## Unreleased

- Generaptr writes a web app next to the API: list, detail, create, and edit pages per table, as json-render specs drawn with shadcn components and Tailwind. The library exports `operations.web.generateWeb` and `operations.web.installWeb`, and the CLI asks for the web app's output directory.
- The web app has a light, dark, and system mode. Its colors are in `src/theme.css`, in the format of a shadcn theme.
- Breaking: keys belong to the table. `DbTable` has `primaryKey`, `uniques`, and `foreignKeys`, each with the name the database gave it. `DbColumn` has no `primary`, `unique`, or `references`. Generaptr 2 OpenAPI documents still read.
- The generated schema keeps key names, composite unique constraints, composite foreign keys, `ON DELETE` and `ON UPDATE` actions, and Postgres `NULLS NOT DISTINCT`.
- The generated schema keeps CHECK constraints, for Postgres and MySQL. A CHECK expression from an OpenAPI document must stay inside its parentheses, and a document read into another dialect keeps no CHECK constraints.
- The generated schema keeps every index: method, column and expression keys, collation, operator class, order, `NULLS FIRST` or `LAST`, `WHERE`, and storage parameters, plus MySQL prefix lengths. Generaptr stops with an error on what Drizzle cannot write: Postgres `INCLUDE` columns, `NULLS NOT DISTINCT` unique indexes, and exclusion constraints, and MySQL `FULLTEXT` and `SPATIAL` indexes.
- The generated schema keeps generated columns (MySQL `STORED` and `VIRTUAL`, Postgres `STORED`), Postgres identity columns with their sequence options, column collations, and MySQL `ON UPDATE CURRENT_TIMESTAMP`. The insert and update schemas leave out identity and generated columns. A generated expression from an OpenAPI document must stay inside its parentheses, and a document read into another dialect keeps an identity column as a serial and drops the rest.
- A type without a Drizzle builder becomes a Drizzle custom type with the exact SQL type, for example `tsvector`, `inet`, `money`, `bit(3)`, MySQL `set(...)`, and multi-dimensional arrays. Binary types (`bytea`, MySQL `blob` and `binary`) carry base64 strings in JSON ([#166](https://github.com/generaptr/generaptr/issues/166)).
- The generated schema keeps Postgres enums that no column uses and sequences that no column owns, with their options. A column that takes its default from such a sequence keeps that default. Drizzle writes every sequence as `bigint`, so generaptr stops with an error on a sequence of another type.
- Breaking: MySQL `binary`, `varbinary`, and blob columns carry base64 strings in the generated API.
- Breaking: a Postgres identity column reads as `DbColumn.identity`, not as `autoIncrement`.
- A fidelity test rebuilds a schema from the generated Drizzle schema and compares the catalogs of both databases.

## 2.1.0

- The generated API has `npm run db:baseline`. On the database that generaptr read, it writes the first migration and records it as applied without running it ([#168](https://github.com/generaptr/generaptr/issues/168)).
- Generaptr reads OpenAPI documents in YAML as well as JSON, in the library and the CLI ([#169](https://github.com/generaptr/generaptr/issues/169)).
- The generated API pins `drizzle-orm` and `drizzle-kit` `1.0.0-rc.5`. npm deprecated the beta line ([#170](https://github.com/generaptr/generaptr/issues/170)).
- The generated API includes related rows: the list and get routes take `?with=`, and `src/db/relations.js` defines both sides of every foreign key, with many-to-many relations through link tables ([#167](https://github.com/generaptr/generaptr/issues/167)).

## 2.0.1

- The package READMEs load the vector logo from the docs site at https://generaptr.github.io/generaptr/.

## 2.0.0

`generaptr` and `generaptr-cli` now live in one repository and release together.

### Breaking changes

- Node 22 or later is necessary. Both packages are ESM.
- The generated API uses Express 5, Drizzle ORM, and zod. Sequelize is removed.
- OpenAPI 3.1 (JSON) replaces RAML as output and input. RAML support is removed.
- The `generaptr` exports changed: `handlers.MySql` and `handlers.Postgres` read tables with `readSchema()`, and `operations` has `api` and `spec`. See [packages/core/README.md](packages/core/README.md).

### New

- PostgreSQL: generaptr reads PostgreSQL schemas, and it writes APIs and specs for PostgreSQL.
- The generated API checks request bodies with zod and returns 400 for a bad body.
- The generated API keeps column defaults, enums, unique keys, and foreign keys from the database.
- The generated API uses Drizzle Kit migrations (`db:generate`, `db:migrate`).
- Generaptr writes `openapi.json` next to every generated API.

### Fixes

- The CLI starts again on current Node versions.
- The CLI accepts a numeric port.
- Generaptr rejects table and column names that are not safe as identifiers, and column defaults from an OpenAPI document that are not literals.
- The generated API hides database errors behind a generic 500.
