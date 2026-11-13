import assert from 'node:assert';
import { DbColumn, DbTable } from '../../../src/commons/types';
import { columnBuilder, renderApi, routedTables, schemaFile } from '../../../src/generators/api/express';

const column = (name: string, columnType: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType, nullable: true, primary: false, unique: false, autoIncrement: false, ...extra,
});

describe('Express + Drizzle generator', () => {
  it.each([
    ['int unsigned', 'int("c", { unsigned: true })'],
    ['smallint', 'smallint("c")'],
    ['bigint unsigned', 'bigint("c", { mode: \'number\', unsigned: true })'],
    ['tinyint(1)', 'boolean("c")'],
    ['decimal(10,2)', 'decimal("c", { precision: 10, scale: 2 })'],
    ['varchar(50)', 'varchar("c", { length: 50 })'],
    ['char(2)', 'char("c", { length: 2 })'],
    ["enum('a','b')", 'mysqlEnum("c", ["a","b"])'],
    ['longtext', 'longtext("c")'],
    ['datetime', 'datetime("c")'],
    ['json', 'json("c")'],
  ])('maps MySQL %s', (columnType: string, call: string) => {
    assert.strictEqual(columnBuilder(column('c', columnType)).call, call);
  });

  it('escapes enum values instead of copying them into code', () => {
    assert.strictEqual(columnBuilder(column('c', "enum('it''s','a\\b')")).call, 'mysqlEnum("c", ["it\'s","a\\\\b"])');
    assert.throws(() => columnBuilder(column('c', 'varchar(1) + evil()')), /Unsupported MySQL type/);
    assert.throws(() => columnBuilder(column('c', 'decimal(10,2);x')), /Unsupported MySQL type/);
  });

  it.each(['../evil', 'users`; drop', 'a b', '1abc'])('rejects the unsafe table name %s', (name: string) => {
    const info = { name: 'x', version: '1.0.0', description: '', author: '', license: 'MIT' };
    assert.throws(() => renderApi([{ name, columns: [column('id', 'int', { primary: true })] }], info), /Unsafe name/);
  });

  it('rejects an unsafe column name', () => {
    const info = { name: 'x', version: '1.0.0', description: '', author: '', license: 'MIT' };
    assert.throws(() => renderApi([{ name: 'users', columns: [column('id: 1, x', 'int')] }], info), /Unsafe name/);
  });

  it('rejects a type it cannot map', () => {
    assert.throws(() => columnBuilder(column('shape', 'geometry')), /Unsupported MySQL type "geometry" for column shape/);
  });

  it('writes keys, a foreign key, and a composite primary key', () => {
    const tables: DbTable[] = [
      { name: 'users', columns: [column('id', 'int', { primary: true, nullable: false, autoIncrement: true })] },
      {
        name: 'users_groups',
        columns: [
          column('user_id', 'int', { primary: true, nullable: false, references: { table: 'users', column: 'id' } }),
          column('group_id', 'int', { primary: true, nullable: false }),
        ],
      },
    ];
    const file: string = schemaFile(tables);

    assert.match(file, /^import \{ int, mysqlTable, primaryKey \} from 'drizzle-orm\/mysql-core';/);
    assert.match(file, /id: int\("id"\)\.autoincrement\(\)\.primaryKey\(\),/);
    assert.match(file, /userId: int\("user_id"\)\.notNull\(\)\.references\(\(\) => users\.id\),/);
    assert.match(file, /\(table\) => \[primaryKey\(\{ columns: \[table\.userId, table\.groupId\] \}\)\]/);
    assert.deepStrictEqual(routedTables(tables).map((table: DbTable) => table.name), ['users']);
  });
});
