import assert from 'node:assert';
import { routedRelations, tableRelations } from '../../src/commons/relations.js';
import type { DbColumn, DbTable } from '../../src/commons/types.js';

const column = (name: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType: 'integer', nullable: false, primary: false, unique: false, autoIncrement: false, ...extra,
});
const ref = (table: string, name = 'id'): Partial<DbColumn> => ({ references: { table, column: name } });

const tables: DbTable[] = [
  { name: 'users', columns: [column('id', { primary: true })] },
  { name: 'accounts', columns: [column('id', { primary: true }), column('user_id', { unique: true, ...ref('users') })] },
  {
    name: 'applications',
    columns: [column('id', { primary: true }), column('account_id', ref('accounts')), column('owner_id', ref('users'))],
  },
  { name: 'groups', columns: [column('id', { primary: true })] },
  {
    name: 'users_groups',
    columns: [column('user_id', { primary: true, ...ref('users') }), column('group_id', { primary: true, ...ref('groups') })],
  },
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
      { name: 'users_groups', columns: [column('user_id', ref('users')), column('group_id', ref('groups'))] },
    ]);
    assert.deepStrictEqual(names(relations, 'groups'), ['many users']);
    assert.deepStrictEqual(names(relations, 'users_groups'), []);
  });

  it('adds the column to the name when one table references another twice', () => {
    const relations = tableRelations([
      { name: 'users', columns: [column('id', { primary: true })] },
      { name: 'tasks', columns: [column('id', { primary: true }), column('author_id', ref('users')), column('assignee_id', ref('users'))] },
    ]);
    assert.deepStrictEqual(names(relations, 'users'), ['many tasksByAuthor', 'many tasksByAssignee']);
    assert.deepStrictEqual(names(relations, 'tasks'), ['one author', 'one assignee']);
  });

  it('never reuses a column key or another relation name', () => {
    const relations = tableRelations([
      { name: 'users', columns: [column('id', { primary: true })] },
      { name: 'posts', columns: [column('id', { primary: true }), column('user', ref('users')), column('users', { columnType: 'text' })] },
    ]);
    assert.deepStrictEqual(names(relations, 'posts'), ['one users2']);
    assert.deepStrictEqual(names(relations, 'users'), ['many posts']);
  });

  it('keeps only relations between tables that have routes', () => {
    const relations = routedRelations([
      ...tables,
      { name: 'audit_log', columns: [column('user_id', ref('users')), column('message', { columnType: 'text' })] },
    ]);
    assert.deepStrictEqual(names(tableRelations([...tables, { name: 'audit_log', columns: [column('user_id', ref('users')), column('message', { columnType: 'text' })] }]), 'users'),
      ['many accounts', 'many applications', 'many groups', 'many auditLog']);
    assert.deepStrictEqual(names(relations, 'users'), ['many accounts', 'many applications', 'many groups']);
    assert.strictEqual(relations.has('audit_log'), false);
    assert.strictEqual(relations.has('users_groups'), false);
  });

  it('skips a foreign key to a table outside the schema', () => {
    const relations = tableRelations([{ name: 'posts', columns: [column('id', { primary: true }), column('user_id', ref('users'))] }]);
    assert.deepStrictEqual(names(relations, 'posts'), []);
  });
});
