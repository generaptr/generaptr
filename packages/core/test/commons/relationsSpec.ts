import assert from 'node:assert';
import { routedRelations, tableRelations } from '../../src/commons/relations.js';
import type { DbColumn, DbForeignKey, DbPrimaryKey, DbTable } from '../../src/commons/types.js';

const column = (name: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType: 'integer', nullable: false, autoIncrement: false, ...extra,
});
const fk = (from: string, table: string): DbForeignKey => ({ name: `${from}_fkey`, columns: [from], table, foreignColumns: ['id'] });
const pk = (...columns: string[]): DbPrimaryKey => ({ name: 'pkey', columns });
const table = (name: string, columns: string[], keys: Partial<DbTable> = {}): DbTable =>
  ({ name, columns: columns.map((c: string) => column(c)), ...keys });

const tables: DbTable[] = [
  table('users', ['id'], { primaryKey: pk('id') }),
  table('accounts', ['id', 'user_id'], { primaryKey: pk('id'), foreignKeys: [fk('user_id', 'users')] }),
  table('applications', ['id', 'account_id', 'owner_id'], {
    primaryKey: pk('id'), foreignKeys: [fk('account_id', 'accounts'), fk('owner_id', 'users')],
  }),
  table('groups', ['id'], { primaryKey: pk('id') }),
  table('users_groups', ['user_id', 'group_id'], {
    primaryKey: pk('user_id', 'group_id'), foreignKeys: [fk('user_id', 'users'), fk('group_id', 'groups')],
  }),
];

const names = (relations: ReturnType<typeof tableRelations>, table: string): string[] =>
  (relations.get(table) ?? []).map((relation) => `${relation.kind} ${relation.name}`);

describe('tableRelations', () => {
  it('names both sides of each foreign key, and many-to-many through link tables', () => {
    const relations = tableRelations(tables);
    assert.deepStrictEqual(names(relations, 'users'), ['many accounts', 'many applications', 'many groups']);
    assert.deepStrictEqual(names(relations, 'accounts'), ['one user', 'many applications']);
    assert.deepStrictEqual(names(relations, 'applications'), ['one account', 'one owner']);
    assert.deepStrictEqual(names(relations, 'groups'), ['many users']);
    assert.deepStrictEqual(names(relations, 'users_groups'), []);
    assert.deepStrictEqual(relations.get('users')?.[2], {
      name: 'groups', kind: 'many', target: 'groups', from: 'id', to: 'id',
      through: { table: 'users_groups', from: 'user_id', to: 'group_id' },
    });
  });

  it('treats a table of exactly two foreign keys and no primary key as a link table', () => {
    const relations = tableRelations([
      ...tables.slice(0, 4),
      table('users_groups', ['user_id', 'group_id'], { foreignKeys: [fk('user_id', 'users'), fk('group_id', 'groups')] }),
    ]);
    assert.deepStrictEqual(names(relations, 'groups'), ['many users']);
    assert.deepStrictEqual(names(relations, 'users_groups'), []);
  });

  it('gives a composite foreign key no relation', () => {
    const relations = tableRelations([
      table('posts', ['author_id', 'slug'], { primaryKey: pk('author_id', 'slug') }),
      table('editions', ['id', 'author_id', 'slug'], {
        primaryKey: pk('id'),
        foreignKeys: [{ name: 'editions_post_fk', columns: ['author_id', 'slug'], table: 'posts', foreignColumns: ['author_id', 'slug'] }],
      }),
    ]);
    assert.deepStrictEqual(names(relations, 'editions'), []);
  });

  it('adds the column to the name when one table references another twice', () => {
    const relations = tableRelations([
      table('users', ['id'], { primaryKey: pk('id') }),
      table('tasks', ['id', 'author_id', 'assignee_id'], {
        primaryKey: pk('id'), foreignKeys: [fk('author_id', 'users'), fk('assignee_id', 'users')],
      }),
    ]);
    assert.deepStrictEqual(names(relations, 'users'), ['many tasksByAuthor', 'many tasksByAssignee']);
    assert.deepStrictEqual(names(relations, 'tasks'), ['one author', 'one assignee']);
  });

  it('never reuses a column key or another relation name', () => {
    const relations = tableRelations([
      table('users', ['id'], { primaryKey: pk('id') }),
      { ...table('posts', ['id', 'user'], { primaryKey: pk('id'), foreignKeys: [fk('user', 'users')] }),
        columns: [column('id'), column('user'), column('users', { columnType: 'text' })] },
    ]);
    assert.deepStrictEqual(names(relations, 'posts'), ['one users2']);
    assert.deepStrictEqual(names(relations, 'users'), ['many posts']);
  });

  it('keeps only relations between tables that have routes', () => {
    const auditLog: DbTable = table('audit_log', ['user_id', 'message'], { foreignKeys: [fk('user_id', 'users')] });
    const relations = routedRelations([
      ...tables,
      auditLog,
    ]);
    assert.deepStrictEqual(names(tableRelations([...tables, auditLog]), 'users'),
      ['many accounts', 'many applications', 'many groups', 'many auditLog']);
    assert.deepStrictEqual(names(relations, 'users'), ['many accounts', 'many applications', 'many groups']);
    assert.strictEqual(relations.has('audit_log'), false);
    assert.strictEqual(relations.has('users_groups'), false);
  });

  it('skips a foreign key to a table outside the schema', () => {
    const relations = tableRelations([table('posts', ['id', 'user_id'], { primaryKey: pk('id'), foreignKeys: [fk('user_id', 'users')] })]);
    assert.deepStrictEqual(names(relations, 'posts'), []);
  });
});
