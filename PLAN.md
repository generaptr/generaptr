# Generaptr modernization plan

Status: in progress on branch `chore/monorepo` (local, not pushed). Updated 2026-11-13.

## Goal

Make generaptr work again on current Node and npm, and make it generate a current API stack.

## Decisions

| Topic | Decision | Status |
|---|---|---|
| Repo layout | One monorepo: `packages/core` (was `generaptr`), `packages/cli` (was `generaptr-cli`). | Agreed |
| Workspace tool | pnpm workspaces + Turbo. CLI depends on `"generaptr": "workspace:*"`. | Agreed |
| History | Merge both repos with `git merge --allow-unrelated-histories`. Keep both histories. | Proposed |
| Runtime | `engines.node >= 22`. CI on Node 22 and 24. CLI is ESM. Core stays CommonJS until Phase 2 rewrites it. | Done |
| Generated API | Express 5 + Drizzle v1 beta (`drizzle-orm` and `drizzle-kit` `1.0.0-beta.22` on 2026-11-13). Pin the exact beta. Move to v1 stable when it ships. | Agreed |
| Migrations | Drizzle native: `drizzle-kit generate` + `drizzle-kit migrate`. Forward-only. No custom migration script. No rollback. A bad migration gets a new forward migration. | Agreed |
| Generated models | Use `drizzle-kit pull` output for `schema.ts`. Delete the Sequelize model generator. | Proposed |
| Spec format | OpenAPI 3.1 replaces RAML (`raml-1-parser` is deprecated upstream). | Proposed |
| Templates | Template files (from `feature/refactoring`) replace TS string literals. | Proposed |
| Tooling | TypeScript 7. Vitest replaces mocha + nyc. Biome (root, lint only) replaces tslint and eslint. typedoc, coveralls, commitizen, npm-run-all, rimraf removed. | Done |
| Releases | Changesets + npm provenance from CI. | Proposed |

## Current state (checked 2026-11-13 in a scratch copy)

Size: core about 3.8k lines of TypeScript. CLI 428 lines of JS.

### Broken today

1. **CLI crashes on start.** chalk 5 and inquirer 9 are ESM-only. `require("chalk").cyan` is `undefined` on Node 24. Dependabot bumped them with no code change.
2. **Generated API crashes on boot.** `npm i sequelize` has no pin and installs v6. v6 removed `sequelize['import']` (`src/generators/api/models/sequelize.ts:39`).
3. **Fresh core install fails.** Git dependency `@types/mysql2: github:types/mysql2` gives `EALLOWGIT` with the local npm config. mysql2 3 ships its own types. Delete it.
4. **npm scripts fail on npm 11.** `npm-run-all` + `config.commitizen` gives `EUNKNOWNCONFIG --commitizen_path`.
5. **tsconfig `types` lists `chalk` and `mysql2`.** tsc stops with TS2688.
6. **One real TS 5 type error:** `src/generators/spec/examples.ts:44`.
7. **Tests: 104 pass, 13 fail.** 2 MySQL tests need a live DB. 11 file-operation tests depend on test order, and their assertion errors become timeouts.
8. **CLI port check is inverted** (`lib/tracks/inputs/database/relational/mysql.js:17`). It accepts `abc` and rejects `3306`, the default.
9. **No CI.** Travis is dead. No GitHub Actions in either repo. Dependabot PRs merged with no checks.
10. **Build tools in runtime `dependencies`:** typescript, tslint, typedoc, rimraf, npm-run-all.
11. **Shell string for install:** `exec("cd ${path} && npm i ...")` (`apiFileOperations.ts:84`) breaks on paths with spaces. Use `spawn` with `cwd`.

### Found during Phase 1

12. **CLI boilerplate flow always failed.** `outputs/database/dialect.js` did not await the handler, so `dialect` was lost and `initializeORM` rejected with "Dialect not supported". Fixed.
13. **Vitest false passes.** Vitest does not call `done` callbacks, so the old callback tests finished at once and their assertions never ran. All such tests become async/await.
14. **Generated models do not match real columns.** The model generator targets Sequelize 4. On Sequelize 5, `underscored: true` maps `firstName` to `first_name`, so `GET /users` and `GET /accounts` return 500. Not fixed: Phase 2 replaces the Sequelize model layer.
15. **pnpm exposed hidden dependencies.** `tslib` (`importHelpers`) only worked through npm hoisting. Fixed by targeting ES2023 without helpers.
16. **inquirer 14 renamed the `list` prompt type to `select`.** Fixed.
17. **`fileUtil.isDirectory()` always returns true** (index 0 of the cut string is `/`). `createDirectoryStructure()` never rejects a file path. Not fixed yet.
18. **The RAML example generator reads a module-level cache** (`cacheUtil`). Output depends on what ran before in the same process. Mocha hid this: `examplesSpec` expected 4 keys only because another spec filled the cache first. Not fixed yet.

### Branches

- `feature/refactoring` (last commit 2019-09, 60 ahead / 26 behind master): **do not merge.** It is on TS 2.8 and Sequelize 4. It drops RAML, the spec generator and most tests. Only the config, controller, entrypoint and middleware generator classes exist. Keep these ideas: `.mst` template files, the `mysql2/promise` handler, and the `Schema` / `Table` / `Column` types.
- `develop` (33 ahead / 11 behind master): never merged. Holds the async/await generated API (#97, #99). Use it as the base for Phase 2 generator work.
- About 110 stale greenkeeper / dependabot branches across both repos: delete.

## Phases

### Phase 0: monorepo skeleton (about ½ day)

- [x] Create the monorepo. Merge `generaptr` into `packages/core` and `generaptr-cli` into `packages/cli` (subtree merge, both histories kept).
- [x] Add `pnpm-workspace.yaml` and `turbo.json` with `build`, `typecheck` and `test` tasks. Lint runs once at the root.
- [x] Add a GitHub Actions workflow for Node 22 and 24, with a MySQL service container.
- [x] Point dependabot at the monorepo (grouped weekly npm updates, monthly actions updates).
- [x] Push the branch and open PR #153. CI passes on Node 22 and 24.
- [ ] Make CI a required check on `master`.
- [ ] Ship later phases as PRs stacked on #153. Merge the whole stack at once.
- [ ] Delete the stale branches.
- [x] Archive the old `generaptr-cli` repo with a pointer to the monorepo. Its open issues #4 (path autocomplete) and #5 (choose models from the schema) are frozen there.

### Phase 1: revive (1–2 days)

- [x] Convert the CLI to ESM. Set `engines.node >= 22` on both packages. (Core ESM moves to Phase 2.)
- [x] Fix items 1, 3, 4, 5, 6, 8 and 10 from "Broken today".
- [x] Move core to promise APIs (`node:fs/promises`, `mysql2/promise` with `?` placeholders, `spawn`).
- [x] Rewrite the file-operation tests as independent async tests (item 7). Result: 119 tests pass, each spec uses its own temp dir.
- [x] Replace mocha + nyc with Vitest. Replace tslint and eslint with Biome.
- [x] Pin every version the generated app installs. Use `spawn` with `cwd` (item 11).
- [x] Gate, boot: the CLI runs end to end against MySQL 8.4 and the generated API boots and serves routes.
- [ ] Gate, data: entity endpoints return 500 (see item 14). Phase 2 fixes this with Drizzle.

### Phase 2: modernize generated output (1–2 weeks)

- [ ] Start from `develop` (async/await generated API).
- [ ] Move generated code into template files.
- [ ] Generated stack: Express 5 + Drizzle v1. Use `drizzle-kit pull` for `schema.ts`.
- [ ] Generated `package.json` scripts: `db:generate` (`drizzle-kit generate`) and `db:migrate` (`drizzle-kit migrate`). Remove the `sequelize-cli` scripts.
- [ ] Optional boot-time migrate with `migrate()` from `drizzle-orm/mysql2/migrator`.
- [ ] Replace RAML output and input with OpenAPI 3.1.
- [ ] Gate: generated API passes a smoke test in CI (boot, migrate, CRUD on one table).

### Phase 3: publish

- [ ] Add Changesets. Publish both packages from CI with npm provenance.

## Open questions

- Add Postgres introspection in Phase 2, or later?
- Is the `develop` async API already in npm `generaptr@1.4.1`? Not checked.
- Is the tool still worth the Phase 2 work? `drizzle-kit pull`, `prisma db pull` and LLM codegen cover part of it. Phases 0–1 are cheap either way.

## Sources

- [Drizzle: Upgrading to v1](https://orm.drizzle.team/docs/upgrade-v1)
- [Drizzle v1.0.0-beta.16 release notes](https://newreleases.io/project/github/drizzle-team/drizzle-orm/release/v1.0.0-beta.16)
- [Drizzle migrations for teams](https://orm.drizzle.team/docs/kit-migrations-for-teams)
- [Discussion #1339: Migrations Rollback](https://www.GitHub.com/drizzle-team/drizzle-orm/discussions/1339)
- [PR #5476: rollback proposal](https://gh.r-mj.com/drizzle-team/drizzle-orm/pull/5476)
