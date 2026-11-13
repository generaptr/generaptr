![](https://i.imgur.com/yCRAubA.png)
========

[![npm](https://badge.fury.io/js/generaptr.svg)](https://badge.fury.io/js/generaptr) [![npm](https://badge.fury.io/js/generaptr-cli.svg)](https://badge.fury.io/js/generaptr-cli) [![CI](https://github.com/generaptr/generaptr/actions/workflows/ci.yml/badge.svg)](https://github.com/generaptr/generaptr/actions/workflows/ci.yml) [![Join the chat at https://gitter.im/generaptr/generaptr](https://badges.gitter.im/generaptr/generaptr.svg)](https://gitter.im/generaptr/generaptr?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Coverage Status](https://coveralls.io/repos/github/generaptr/generaptr/badge.svg?branch=master)](https://coveralls.io/github/generaptr/generaptr?branch=master)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr?ref=badge_shield)

Generaptr reads the tables of a MySQL or PostgreSQL database and writes two things:

- A REST API: Express 5, Drizzle ORM, and zod validation, with one CRUD route per table.
- An OpenAPI 3.1 document that describes that API exactly.

Generaptr can also read an OpenAPI document back and write the API from it.

```sh
npx generaptr-cli
```

| Package | Path | Use it to |
|---|---|---|
| [`generaptr-cli`](packages/cli) | `packages/cli` | Answer prompts and get an API or a spec. |
| [`generaptr`](packages/core) | `packages/core` | Call the same steps from your own code. |

Both packages need Node 22 or later. They release together with the same version.

## The generated API

```
api/
├── package.json        # express, drizzle-orm, the driver, zod (exact versions)
├── drizzle.config.js
├── .env.example        # DATABASE_URL
├── openapi.json
└── src/
    ├── index.js
    ├── app.js          # mounts one router per table
    ├── db/
    │   ├── index.js
    │   └── schema.js   # one Drizzle table per database table
    └── routes/
        └── <table>.js  # list, get, create, update, delete
```

- Each table with one primary key gets `GET /<table>`, `POST /<table>`, `GET|PUT|DELETE /<table>/{id}`. Link tables with a composite key get no routes.
- The list route takes `limit` (at most 100, default 20) and `offset`.
- zod schemas from `drizzle-orm/zod` check request bodies. A bad body gets 400 with the zod issues.
- Database errors get a generic 500. The response does not show the database message.
- Column defaults from the database stay in the schema, so a client can leave those columns out.

Run it:

```sh
cd api
cp .env.example .env    # then set DATABASE_URL
npm start
```

### Migrations

The generated API uses Drizzle Kit migrations. Migrations go forward only. To undo a change, write a new migration.

```sh
npm run db:generate     # writes SQL from src/db/schema.js
npm run db:migrate      # applies the SQL
```

> [!WARNING]
> The first `db:generate` writes `CREATE TABLE` for every table. Do not run `db:migrate` against the database that generaptr read: those tables exist there already.

## Supported column types

| MySQL | PostgreSQL |
|---|---|
| `tinyint`, `smallint`, `mediumint`, `int`, `bigint`, `year` (signed or `unsigned`) | `smallint`, `integer`, `bigint`, serial and identity columns |
| `tinyint(1)` as boolean | `boolean` |
| `decimal(p,s)` | `numeric(p,s)` |
| `varchar(n)`, `char(n)`, `binary(n)`, `varbinary(n)` | `character varying(n)`, `character(n)` |
| `enum(...)` | enum types (`CREATE TYPE ... AS ENUM`) |
| text and blob types, `date`, `datetime`, `timestamp`, `time`, `json`, `float`, `double` | `text`, `date`, `time`, `timestamp` with or without time zone and precision, `json`, `jsonb`, `uuid`, `real`, `double precision` |
| | One-dimensional arrays of the types above, for example `text[]` |

Generaptr stops with `Unsupported type` when a table has any other type. It also stops when a table or column name has characters other than letters, digits, and `_`.

## Known limits

- PostgreSQL `bytea` and `tsvector` are not supported. JSON cannot carry them as they are.
- The generated API has no relation includes. Each route reads one table.
- Generaptr reads OpenAPI documents in JSON only, not YAML.
- The generated API pins `drizzle-orm` and `drizzle-kit` `1.0.0-beta.22`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Changes per release are in [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr?ref=badge_large)
