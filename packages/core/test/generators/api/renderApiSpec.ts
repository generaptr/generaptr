import { DbColumn, DbTable } from '../../../src/commons/types.js';
import { renderApi } from '../../../src/generators/api/express.js';

const column = (name: string, columnType: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType, nullable: false, primary: false, unique: false, autoIncrement: false, ...extra,
});

const tables: DbTable[] = [
  {
    name: 'users',
    columns: [
      column('id', 'int unsigned', { primary: true, autoIncrement: true }),
      column('firstName', 'varchar(255)', { nullable: true }),
      column('email', 'varchar(50)', { unique: true }),
      column('role', "enum('admin','member')"),
    ],
  },
  {
    name: 'accounts',
    columns: [
      column('code', 'char(8)', { primary: true }),
      column('user_id', 'int unsigned', { unique: true, references: { table: 'users', column: 'id' } }),
    ],
  },
  {
    name: 'users_groups',
    columns: [
      column('user_id', 'int unsigned', { primary: true, references: { table: 'users', column: 'id' } }),
      column('group_id', 'int unsigned', { primary: true }),
    ],
  },
];

const info = { name: 'demo', version: '1.0.0', description: '', author: 'me', license: 'MIT' };

const postgresTables: DbTable[] = [
  {
    name: 'users',
    columns: [
      column('id', 'integer', { primary: true, autoIncrement: true }),
      column('email', 'character varying(50)', { unique: true }),
      column('role', "enum('admin','member')", { enumName: 'user_role' }),
      column('balance', 'numeric(10,2)', { nullable: true }),
      column('created_at', 'timestamp with time zone'),
      column('settings', 'jsonb', { nullable: true }),
    ],
  },
  {
    name: 'events',
    columns: [
      column('id', 'bigint', { primary: true, autoIncrement: true }),
      column('user_id', 'integer', { references: { table: 'users', column: 'id' } }),
      column('external_id', 'uuid'),
    ],
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
