# Changelog

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
