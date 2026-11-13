# Generaptr modernization plan

Status: draft, 2026-11-13. Move this file into the monorepo root after Phase 0.

## Goal

Make generaptr work again on current Node and npm, and make it generate a current API stack.

## Decisions

| Topic | Decision | Status |
|---|---|---|
| Repo layout | One monorepo: `packages/core` (was `generaptr`), `packages/cli` (was `generaptr-cli`). | Agreed |
| Workspace tool | pnpm workspaces + Turbo. CLI depends on `"generaptr": "workspace:*"`. | Agreed |
| History | Merge both repos with `git merge --allow-unrelated-histories`. Keep both histories. | Proposed |
| Runtime | ESM only. `engines.node >= 22`. CI on Node 22 and 24. | Proposed |
| Generated API | Express 5 + Drizzle (v1). | Agreed |
| Migrations | Drizzle native: `drizzle-kit generate` + `drizzle-kit migrate`. Forward-only. No custom migration script. No rollback. A bad migration gets a new forward migration. | Agreed |
| Generated models | Use `drizzle-kit pull` output for `schema.ts`. Delete the Sequelize model generator. | Proposed |
| Spec format | OpenAPI 3.1 replaces RAML (`raml-1-parser` is deprecated upstream). | Proposed |
| Templates | Template files (from `feature/refactoring`) replace TS string literals. | Proposed |
| Tooling | Vitest replaces mocha + nyc. Biome replaces tslint. Remove typedoc, coveralls, commitizen, npm-run-all, rimraf. | Proposed |
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

### Branches

- `feature/refactoring` (last commit 2019-09, 60 ahead / 26 behind master): **do not merge.** It is on TS 2.8 and Sequelize 4. It drops RAML, the spec generator and most tests. Only the config, controller, entrypoint and middleware generator classes exist. Keep these ideas: `.mst` template files, the `mysql2/promise` handler, and the `Schema` / `Table` / `Column` types.
- `develop` (33 ahead / 11 behind master): never merged. Holds the async/await generated API (#97, #99). Use it as the base for Phase 2 generator work.
- About 110 stale greenkeeper / dependabot branches across both repos: delete.

## Phases

### Phase 0: monorepo skeleton (about ½ day)

- [ ] Create the monorepo. Merge `generaptr` into `packages/core` and `generaptr-cli` into `packages/cli`.
- [ ] Add `pnpm-workspace.yaml` and `turbo.json` with `build`, `lint`, `typecheck` and `test` tasks.
- [ ] Add a GitHub Actions workflow for Node 22 and 24, with a MySQL service container.
- [ ] Point dependabot at the monorepo, and only let PRs merge when CI passes.
- [ ] Delete the stale branches.
- [ ] Archive the old `generaptr-cli` repo with a pointer to the monorepo.

### Phase 1: revive (1–2 days)

- [ ] Convert both packages to ESM. Set `engines.node >= 22`.
- [ ] Fix items 1, 3, 4, 5, 6, 8 and 10 from "Broken today".
- [ ] Rewrite the file-operation tests as independent async tests (item 7).
- [ ] Replace mocha + nyc with Vitest. Replace tslint with Biome.
- [ ] Pin every version the generated app installs. Use `spawn` with `cwd` (item 11).
- [ ] Gate: CLI runs end to end against a local MySQL and produces an API that boots.

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

- Is Drizzle v1 stable when Phase 2 starts? (A July 2026 changelog says release candidate.) If not, pin the RC.
- Add Postgres introspection in Phase 2, or later?
- Is the `develop` async API already in npm `generaptr@1.4.1`? Not checked.
- Is the tool still worth the Phase 2 work? `drizzle-kit pull`, `prisma db pull` and LLM codegen cover part of it. Phases 0–1 are cheap either way.

## Sources

- [Drizzle: Upgrading to v1](https://orm.drizzle.team/docs/upgrade-v1)
- [Drizzle v1.0.0-beta.16 release notes](https://newreleases.io/project/github/drizzle-team/drizzle-orm/release/v1.0.0-beta.16)
- [Drizzle migrations for teams](https://orm.drizzle.team/docs/kit-migrations-for-teams)
- [Discussion #1339: Migrations Rollback](https://www.GitHub.com/drizzle-team/drizzle-orm/discussions/1339)
- [PR #5476: rollback proposal](https://gh.r-mj.com/drizzle-team/drizzle-orm/pull/5476)
