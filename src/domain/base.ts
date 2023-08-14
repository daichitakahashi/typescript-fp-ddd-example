import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import { parse, type BaseSchema, type Output } from 'valibot';

export const createEntity = <Props>(sym: symbol, props: Props) => ({
  [sym]: true,
  ...props,
});

export const validate =
  <Schema extends BaseSchema<any, any>>(schema: Schema) =>
  (input: Output<Schema>): E.Either<Error, Output<Schema>> => {
    try {
      return E.right(parse(schema, input));
    } catch (err: any) {
      return E.left(err as Error);
    }
  };

export const validatePartial =
  <
    Schema extends BaseSchema<any, any>,
    Props,
    Key extends keyof Props,
    Value extends Props[Key],
  >(
    schema: Schema,
    key: Key,
    value: Value,
  ) =>
  (target: Props) =>
    f.pipe(
      { [key]: value },
      validate(schema),
      E.map((validated) => ({
        ...target,
        [key]: validated[key as keyof Output<typeof schema>],
      })),
    );

export const conditional =
  <E, A>(cond: (a: A) => boolean, ifTrue: (a: A) => E.Either<E, A>) =>
  (a: A): E.Either<E, A> =>
    cond(a) ? ifTrue(a) : E.right<E, A>(a);
