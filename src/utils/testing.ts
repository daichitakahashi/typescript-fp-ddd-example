import * as E from 'fp-ts/Either';

export const deepStrictEqual = <A>(actual: A, expected: A) => {
  expect(actual).toStrictEqual(expected);
  return actual;
};

export const mustRight = <Right>() =>
  E.match<unknown, Right, Right>(
    (e) => {
      throw new Error(`unexpected error: ${e}`);
    },
    (user) => user,
  );
