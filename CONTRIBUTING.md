# Contributing

Open an issue before a large change, so we can agree on the approach first. Obey the [Code of Conduct](CODE_OF_CONDUCT.md).

## Set up

You need Node 22 or later, Docker, and pnpm through Corepack (`corepack enable`).

```sh
pnpm install
pnpm build
```

The tests read real databases. Start one MySQL and one PostgreSQL container, then load the fixtures:

```sh
docker run -d --name generaptr-mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=test -p 3306:3306 mysql:8.4
docker run -d --name generaptr-postgres -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=test -p 5433:5432 postgres:17

docker exec -i generaptr-mysql mysql -uroot -psecret test < packages/core/test/handlers/mysql/data.sql
docker exec -i generaptr-postgres psql -U postgres -d test < packages/core/test/handlers/postgres/data.sql
```

Wait until MySQL accepts connections before you load its fixture. Connection details for the tests are in `packages/core/test/config.ts`.

## Check

```sh
pnpm lint        # Biome
pnpm typecheck
pnpm test        # Vitest; the end-to-end test installs and boots a generated API for each engine
```

CI runs the same steps on Node 22 and 24. A pull request merges only when CI passes.

When a change alters a generated file, the snapshot test fails. Look at the diff. If the change is correct, run `pnpm --filter generaptr exec vitest run -u` and commit the new snapshot.

## Layout

- `packages/core/src/handlers`: reads tables from MySQL (`information_schema`) and PostgreSQL (`pg_catalog`).
- `packages/core/src/commons/columns.ts`: parses column types. Each type the generators accept is listed here.
- `packages/core/src/generators/api`: builds view models for the API templates.
- `packages/core/templates/api`: the eta templates of the generated files.
- `packages/core/src/generators/spec`: writes and reads OpenAPI 3.1.
- `packages/cli/lib`: the prompts.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org): `type(scope): summary`, for example `fix(core): keep enum labels with quotes`.

## Release

Both packages release together with the same version.

1. Set the new `version` in `packages/core/package.json` and `packages/cli/package.json`.
2. Add a section to `CHANGELOG.md`.
3. Merge to `master`.
4. Tag the merge commit and push the tag: `git tag v2.1.0 && git push origin v2.1.0`.
5. Approve the staged versions with 2FA: core first, then the CLI, because the CLI depends on the new core. Use **Staged Packages** on npmjs.com, or `npm stage list generaptr` and `npm stage approve <stage-id>`.

The `release` workflow runs CI. It then checks that the tag equals both versions and stages `generaptr` and `generaptr-cli` on npm with provenance. It uses npm trusted publishing, so it needs no npm token. The trusted publisher of each package allows `npm stage publish` only, so CI cannot release a version without a maintainer.

A version that is already on npm is skipped. When a run fails after it staged core, approve or reject that staged version before you run the workflow again.
