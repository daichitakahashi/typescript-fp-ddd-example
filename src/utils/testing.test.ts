import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import { deepStrictEqual, mustRight } from './testing';

describe('deepStrictEqual', () => {
  class sample {
    constructor(
      public name: string,
      public age: number,
    ) {}
  }
  it('値が一致することをテストできる', () => {
    deepStrictEqual(new sample('john doe', 36), new sample('john doe', 36));
  });
  it('値が一致しないことをテストできる', () => {
    expect(() => {
      deepStrictEqual(new sample('john doe', 36), new sample('bob', 45));
    }).toThrow();
  });
});

describe('mustRight', () => {
  it('rightの値を取り出すことができる', () => {
    expect(f.pipe(E.right(9), mustRight)).toBe(9);
  });
  it('leftの場合例外をスローする', () => {
    expect(() => {
      f.pipe(E.left(null), mustRight);
    }).toThrow();
  });
});
