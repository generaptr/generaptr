![generaptr](https://generaptr.github.io/generaptr/logo.svg)
========

[![npm](https://badge.fury.io/js/generaptr.svg)](https://badge.fury.io/js/generaptr) [![CI](https://github.com/generaptr/generaptr/actions/workflows/ci.yml/badge.svg)](https://github.com/generaptr/generaptr/actions/workflows/ci.yml) [![Join the chat at https://gitter.im/generaptr/generaptr](https://badges.gitter.im/generaptr/generaptr.svg)](https://gitter.im/generaptr/generaptr?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Coverage Status](https://coveralls.io/repos/github/generaptr/generaptr/badge.svg?branch=master)](https://coveralls.io/github/generaptr/generaptr?branch=master)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr?ref=badge_shield)

The library behind [`generaptr-cli`](../cli). It reads tables from MySQL, PostgreSQL, or an OpenAPI 3.1 document, and writes an Express 5 + Drizzle API or an OpenAPI document. See the [root README](../../README.md) for what the generated API contains.

```sh
npm install generaptr
```

Node 22 or later is necessary. The package is ESM. `require('generaptr')` also works through Node's `require(esm)`.

## Usage

```js
import { handlers, operations } from 'generaptr';

const info = { name: 'shop-api', version: '1.0.0', description: '', author: '', license: 'MIT' };

// Read the tables. Use handlers.MySql with the same options, without `schema`.
const db = new handlers.Postgres({
  host: '127.0.0.1', port: 5432, user: 'postgres', password: 'secret', database: 'shop', schema: 'public',
});
await db.connect();
const schema = await db.readSchema();
await db.close();

// Write the API, then install its dependencies.
await operations.api.generateApi('./shop-api', info, schema);
await operations.api.installApi('./shop-api');

// Write the web app for the same API, then install its dependencies.
await operations.web.generateWeb('./shop-web', info, schema);
await operations.web.installWeb('./shop-web');

// Write only the OpenAPI document.
await operations.spec.generateSpec('./spec', info, schema);

// Read an OpenAPI document as tables for one engine.
const fromSpec = await operations.spec.readOpenApi('./spec/openapi.json', 'mysql');
```

| Export | Does |
|---|---|
| `handlers.MySql`, `handlers.Postgres` | `connect()` checks the connection. `readSchema()` returns `{ dialect, tables }`. `close()` ends the pool. |
| `operations.api.generateApi(dir, info, schema)` | Writes the API into `dir`. Returns the paths it wrote. |
| `operations.api.installApi(dir)` | Runs `npm install` in `dir`. |
| `operations.web.generateWeb(dir, info, schema)` | Writes the web app into `dir`. Returns the paths it wrote. |
| `operations.web.installWeb(dir)` | Runs `npm install` in `dir`. |
| `operations.spec.generateSpec(dir, info, schema)` | Writes `dir/openapi.json`. Returns its path. |
| `operations.spec.readOpenApi(file, dialect)` | Reads an OpenAPI document in YAML or JSON. `dialect` is `'mysql'` or `'postgresql'`. |

`readOpenApi` accepts a column default from the document only when it is a literal or a known function such as `now()`. The default goes into SQL, and a document can come from anyone.

## License

MIT

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr?ref=badge_large)
