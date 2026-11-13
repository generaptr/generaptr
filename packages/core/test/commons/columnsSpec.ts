import assert from 'node:assert';
import { camel } from '../../src/commons/columns.js';

describe('camel', () => {
  it.each([['user_id', 'userId'], ['_id', 'Id'], ['a__b', 'aB'], ['a-b c', 'aBC'], ['a_', 'a_'], ['a_1', 'a1']])(
    'writes %s as %s',
    (name: string, expected: string) => assert.strictEqual(camel(name), expected),
  );

  it('takes linear time on a long run of separators', () => {
    const started: number = performance.now();
    assert.strictEqual(camel(`a${'\t'.repeat(100000)}`), `a${'\t'.repeat(100000)}`);
    assert.ok(performance.now() - started < 1000);
  });
});
