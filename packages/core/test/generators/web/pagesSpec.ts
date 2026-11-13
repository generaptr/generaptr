// biome-ignore-all lint/suspicious/noTemplateCurlyInString: json-render templates read state with ${/path}.
import assert from 'node:assert';
import type { DbColumn, DbTable } from '../../../src/commons/types.js';
import { openApiDocument } from '../../../src/generators/spec/openapi.js';
import { type Element, type Page, webPages } from '../../../src/generators/web/pages.js';

const column = (name: string, columnType: string, extra: Partial<DbColumn> = {}): DbColumn => ({
  name, columnType, nullable: false, autoIncrement: false, ...extra,
});

const tables: DbTable[] = [
  {
    name: 'users',
    columns: [
      column('id', 'int', { autoIncrement: true }),
      column('email', 'varchar(50)'),
      column('active', 'tinyint(1)'),
      column('role', "enum('admin','member')"),
      column('avatar', 'blob', { nullable: true }),
      column('created_at', 'datetime', { default: 'CURRENT_TIMESTAMP' }),
    ],
    primaryKey: { name: 'PRIMARY', columns: ['id'] },
  },
  {
    name: 'user_accounts',
    columns: [column('code', 'varchar(10)'), column('owner_id', 'int')],
    primaryKey: { name: 'PRIMARY', columns: ['code'] },
    foreignKeys: [{ name: 'fk', columns: ['owner_id'], table: 'users', foreignColumns: ['id'] }],
  },
];
const doc = openApiDocument({ dialect: 'mysql', tables }, { name: 'demo', version: '1.0.0', description: '' });
const { title, resources } = webPages(doc);
const resource = (name: string) => resources.find((r) => r.name === name) as (typeof resources)[number];
const elements = (page: Page): Element[] => Object.values(page.spec.elements);
const labelled = (page: Page, label: string): Element | undefined =>
  elements(page).find((element: Element) => element.props.label === label);

describe('web pages', () => {
  it('makes one resource per route, at the path the API serves', () => {
    assert.strictEqual(title, 'demo');
    assert.deepStrictEqual(resources.map((r) => [r.name, r.path, r.title]), [
      ['users', '/users', 'Users'],
      ['user_accounts', '/user-accounts', 'User accounts'],
    ]);
  });

  it('loads a page of rows on the list page, and opens a row by its primary key', () => {
    const { list } = resource('user_accounts').pages;
    assert.deepStrictEqual(list.load, [{ path: { $template: '/user-accounts?limit=20&offset=${/offset}' }, into: '/rows' }]);
    assert.deepStrictEqual(labelled(list, 'Open')?.on, { press: { action: 'navigate', params: { base: '/user-accounts', id: { $item: 'code' } } } });
  });

  it('loads related rows on the detail page', () => {
    assert.deepStrictEqual(resource('users').pages.detail.load, [{ path: { $template: '/users/${/route/id}?with=userAccounts' }, into: '/row' }]);
    assert.deepStrictEqual(resource('user_accounts').pages.detail.load, [{ path: { $template: '/user-accounts/${/route/id}?with=owner' }, into: '/row' }]);
  });

  it('links a foreign key to its row, and shows a relation only when it has rows', () => {
    const { detail } = resource('user_accounts').pages;
    const link = elements(detail).find((element: Element) => element.type === 'Link' && element.props.label?.toString() !== undefined
      && JSON.stringify(element.props.href) === JSON.stringify({ $template: '#/users/${/row/ownerId}' }));
    assert.deepStrictEqual(link?.visible, { $state: '/row/ownerId' });
    const owner = elements(detail).find((element: Element) => element.type === 'Card' && element.props.title === 'Owner');
    assert.deepStrictEqual(owner?.visible, { $state: '/row/owner' });
    const accounts = elements(resource('users').pages.detail).find((element: Element) => element.props.title === 'User accounts');
    assert.deepStrictEqual(accounts?.visible, { $state: '/row/userAccounts/0' });
  });

  it('fills the page width with every vertical stack', () => {
    for (const page of Object.values(resource('users').pages)) {
      const stacks: Element[] = elements(page).filter((element: Element) => element.type === 'Stack' && element.props.direction === 'vertical');
      assert.ok(stacks.length && stacks.every((stack: Element) => stack.props.align === 'stretch'));
    }
  });

  it('builds the create form from the input schema, with a select of rows for a foreign key', () => {
    const { create } = resource('user_accounts').pages;
    assert.strictEqual(labelled(create, 'Owner id (Users)')?.type, 'Select');
    assert.deepStrictEqual(create.load, [{ path: '/users?limit=100', into: '/options/ownerId', pluck: 'id' }]);
    assert.deepStrictEqual(labelled(create, 'Code')?.props.checks, [
      { type: 'required', message: 'Code is required.' },
      { type: 'maxLength', args: { max: 10 }, message: 'Code has at most 10 characters.' },
    ]);
  });

  it('leaves out columns the database fills, and picks an input for each type', () => {
    const { create, edit } = resource('users').pages;
    assert.strictEqual(labelled(create, 'Id'), undefined);
    assert.strictEqual(labelled(create, 'Active')?.type, 'Switch');
    assert.deepStrictEqual(labelled(create, 'Role')?.props.options, ['admin', 'member']);
    assert.strictEqual(labelled(create, 'Email')?.props.type, 'email');
    assert.strictEqual(labelled(create, 'Avatar')?.props.placeholder, 'Base64');
    assert.strictEqual(labelled(create, 'Created at')?.props.placeholder, 'Leave empty for CURRENT_TIMESTAMP');
    const save = (page: Page): object => {
      const button = labelled(page, page === create ? 'Create user' : 'Save changes') as Element;
      return (button.on as { press: { params: object }[] }).press[1].params;
    };
    assert.deepStrictEqual(
      { ...save(create), fields: undefined },
      { method: 'POST', path: '/users', partial: false, next: '/users', nextKey: 'id', fields: undefined },
    );
    assert.strictEqual((save(edit) as { method: string }).method, 'PUT');
  });
});
