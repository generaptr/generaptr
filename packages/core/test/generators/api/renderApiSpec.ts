import { DbColumn, DbTable } from '../../../src/commons/types.js';
import { renderApi } from '../../../src/generators/api/express.js';

const column = (name: string, columnType: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType, nullable: false, autoIncrement: false, ...extra,
});

const tables: DbTable[] = [
  {
    name: 'users',
    columns: [
      column('id', 'int unsigned', { autoIncrement: true }),
      column('firstName', 'varchar(255)', { nullable: true }),
      column('email', 'varchar(50)'),
      column('role', "enum('admin','member')"),
    ],
    primaryKey: { name: 'PRIMARY', columns: ['id'] },
    uniques: [{ name: 'email', columns: ['email'] }],
  },
  {
    name: 'accounts',
    columns: [
      column('code', 'char(8)'),
      column('user_id', 'int unsigned'),
    ],
    primaryKey: { name: 'PRIMARY', columns: ['code'] },
    uniques: [{ name: 'user_id', columns: ['user_id'] }],
    foreignKeys: [{ name: 'accounts_ibfk_1', columns: ['user_id'], table: 'users', foreignColumns: ['id'] }],
  },
  {
    name: 'users_groups',
    columns: [
      column('user_id', 'int unsigned'),
      column('group_id', 'int unsigned'),
    ],
    primaryKey: { name: 'PRIMARY', columns: ['user_id', 'group_id'] },
    foreignKeys: [{ name: 'users_groups_ibfk_1', columns: ['user_id'], table: 'users', foreignColumns: ['id'], onDelete: 'cascade' }],
  },
];

const info = { name: 'demo', version: '1.0.0', description: '', author: 'me', license: 'MIT' };

const postgresTables: DbTable[] = [
  {
    name: 'users',
    columns: [
      column('id', 'integer', { autoIncrement: true }),
      column('email', 'character varying(50)'),
      column('role', "enum('admin','member')", { enumName: 'user_role' }),
      column('balance', 'numeric(10,2)', { nullable: true }),
      column('created_at', 'timestamp with time zone'),
      column('settings', 'jsonb', { nullable: true }),
    ],
    primaryKey: { name: 'users_pkey', columns: ['id'] },
    uniques: [{ name: 'users_email_key', columns: ['email'] }],
  },
  {
    name: 'events',
    columns: [
      column('id', 'bigint', { autoIncrement: true }),
      column('user_id', 'integer'),
      column('external_id', 'uuid'),
    ],
    primaryKey: { name: 'events_pkey', columns: ['id'] },
    foreignKeys: [{ name: 'events_user_id_fkey', columns: ['user_id'], table: 'users', foreignColumns: ['id'], onDelete: 'set null' }],
  },
];

describe('renderApi for Postgres', () => {
  it.each(Object.entries(renderApi({ dialect: 'postgresql', tables: postgresTables }, info)))(
    'writes %s',
    (_file: string, content: string) => {
      expect(content).toMatchSnapshot();
    },
  );
});

describe('renderApi', () => {
  it.each(Object.entries(renderApi({ dialect: 'mysql', tables }, info)))(
    'writes %s',
    (_file: string, content: string) => {
      expect(content).toMatchSnapshot();
    },
  );
});
