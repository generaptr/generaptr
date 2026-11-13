![](https://i.imgur.com/yCRAubA.png)
========

[![npm](https://badge.fury.io/js/generaptr-cli.svg)](https://badge.fury.io/js/generaptr-cli) [![CI](https://github.com/generaptr/generaptr/actions/workflows/ci.yml/badge.svg)](https://github.com/generaptr/generaptr/actions/workflows/ci.yml) [![Join the chat at https://gitter.im/generaptr/generaptr](https://badges.gitter.im/generaptr/generaptr.svg)](https://gitter.im/generaptr/generaptr?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr-cli.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr-cli?ref=badge_shield)

Prompts for a database or an OpenAPI file, then writes a REST API or an OpenAPI 3.1 document. See the [root README](../../README.md) for what the generated API contains.

```sh
npx generaptr-cli
```

Or install it:

```sh
npm install --global generaptr-cli
generaptr
```

Node 22 or later is necessary.

## Boilerplate API

1. Select **Boilerplate API**.
2. Type the output directory, name, description, version, license, and author.
3. Select the source of the tables:
   - **Database**: select MySQL or PostgreSQL, then type the connection details. For PostgreSQL, also type the schema (default `public`). The user needs only read access.
   - **OpenAPI 3.1 file (JSON)**: type the path to the file, then select the database engine for the generated API.
4. Generaptr writes the API. It then asks before it runs `npm install` in the output directory.

## OpenAPI specification

1. Select **OpenAPI Specification**.
2. Type the output directory and the API details.
3. Connect to a MySQL or PostgreSQL database.
4. Generaptr writes `openapi.json` into the output directory.

An `openapi.json` that generaptr wrote reads back to the same tables. Other OpenAPI documents map by convention: each object schema becomes a table, and a property `id` becomes the primary key.

## License

MIT

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr-cli.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fgeneraptr%2Fgeneraptr-cli?ref=badge_large)
