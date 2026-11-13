import { camel, pascal, primaryColumns } from './columns.js';
import type { DbColumn, DbTable } from './types.js';

/** One Drizzle relation. `from` and `to` are column names on the source and target tables. */
export type Relation = {
  name: string;
  kind: 'one' | 'many';
  target: string;
  from: string;
  to: string;
  through?: { table: string; from: string; to: string };
};

type ForeignKey = DbColumn & { references: { table: string; column: string } };

/** `user_id` and `userId` become `user`. A name without an id suffix stays undefined. */
const stripId = (name: string): string | undefined => {
  const stripped: string = name.replace(/_?id$/i, '');

  return stripped && stripped !== name ? stripped : undefined;
};

/**
 * A link table has a primary key of exactly two foreign keys, or no primary key and only two columns,
 * both foreign keys. It gets no routes and no relations of its own.
 */
const linkColumns = (table: DbTable, known: Set<string>): [ForeignKey, ForeignKey] | undefined => {
  const primary: DbColumn[] = primaryColumns(table);
  const candidates: DbColumn[] = primary.length ? primary : table.columns;
  const keys = candidates.filter((column: DbColumn): column is ForeignKey => Boolean(column.references && known.has(column.references.table)));

  return candidates.length === 2 && keys.length === 2 ? [keys[0], keys[1]] : undefined;
};

/**
 * Names both sides of each foreign key, keyed by table name. Link tables become many-to-many relations
 * through the link table. A name never repeats a column key or another relation of the same table.
 */
export const tableRelations = (tables: DbTable[]): Map<string, Relation[]> => {
  const known: Set<string> = new Set(tables.map((table: DbTable) => table.name));
  const relations: Map<string, Relation[]> = new Map(tables.map((table: DbTable) => [table.name, []]));
  const add = (table: string, relation: Relation): void => {
    const own: Relation[] = relations.get(table) ?? [];
    const columns: DbColumn[] = tables.find((t: DbTable) => t.name === table)?.columns ?? [];
    const taken: Set<string> = new Set([...columns.map((column: DbColumn) => camel(column.name)), ...own.map((r: Relation) => r.name)]);
    let name: string = relation.name;
    for (let n = 2; taken.has(name); n++) {
      name = `${relation.name}${n}`;
    }
    own.push({ ...relation, name });
  };

  for (const table of tables) {
    const link = linkColumns(table, known);
    if (link) {
      const [a, b] = link;
      const self: boolean = a.references.table === b.references.table;
      const label = (column: ForeignKey): string =>
        self ? `${camel(column.references.table)}By${pascal(stripId(column.name) ?? column.name)}` : camel(column.references.table);
      add(a.references.table, {
        name: label(b), kind: 'many', target: b.references.table, from: a.references.column, to: b.references.column,
        through: { table: table.name, from: a.name, to: b.name },
      });
      add(b.references.table, {
        name: label(a), kind: 'many', target: a.references.table, from: b.references.column, to: a.references.column,
        through: { table: table.name, from: b.name, to: a.name },
      });
      continue;
    }
    const keys: ForeignKey[] = table.columns.filter((column: DbColumn): column is ForeignKey =>
      Boolean(column.references && known.has(column.references.table)));
    for (const key of keys) {
      const target: string = key.references.table;
      const twice: boolean = keys.filter((other: ForeignKey) => other.references.table === target).length > 1;
      add(table.name, {
        name: camel(stripId(key.name) ?? target), kind: 'one', target, from: key.name, to: key.references.column,
      });
      add(target, {
        name: twice ? `${camel(table.name)}By${pascal(stripId(key.name) ?? key.name)}` : camel(table.name),
        kind: 'many', target: table.name, from: key.references.column, to: key.name,
      });
    }
  }

  return relations;
};
