# generaptr

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
| `operations.spec.generateSpec(dir, info, schema)` | Writes `dir/openapi.json`. Returns its path. |
| `operations.spec.readOpenApi(file, dialect)` | Reads a JSON OpenAPI document. `dialect` is `'mysql'` or `'postgresql'`. |

`readOpenApi` accepts a column default from the document only when it is a literal or a known function such as `now()`. The default goes into SQL, and a document can come from anyone.

## License

MIT
