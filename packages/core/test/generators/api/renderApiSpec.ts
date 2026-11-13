import { DbColumn, DbTable } from '../../../src/commons/types';
import { renderApi } from '../../../src/generators/api/express';

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

describe('renderApi', () => {
  it.each(Object.entries(renderApi(tables, { name: 'demo', version: '1.0.0', description: '', author: 'me', license: 'MIT' })))(
    'writes %s',
    (file: string, content: string) => {
      expect(content).toMatchSnapshot();
    },
  );
});
