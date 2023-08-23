import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';

export const deepStrictEqual = <A>(actual: A, expected: A) => {
  expect(actual).toStrictEqual(expected);
  return actual;
};

export function mustRight<Right>(t: E.Either<unknown, Right>) {
  return f.pipe(
    t,
    E.match<unknown, Right, Right>(
      (e) => {
        throw new Error(`unexpected error: ${e}`);
      },
      (a) => a,
    ),
  );
}
