import { left, right, map, type Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import { parse, type BaseSchema, type Output } from 'valibot';

export const createEntity = <Props>(sym: symbol, props: Props) => ({
  [sym]: true,
  ...props,
});

export const validate =
  <Schema extends BaseSchema<any, any>>(schema: Schema) =>
  (input: Output<Schema>): Either<Error, Output<Schema>> => {
    try {
      return right(parse(schema, input));
    } catch (err: any) {
      return left(err as Error);
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
    pipe(
      { [key]: value },
      validate(schema),
      map((validated) => ({
        ...target,
        [key]: validated[key as keyof Output<typeof schema>],
      })),
    );

export const conditional =
  <E, A>(cond: (a: A) => boolean, ifTrue: (a: A) => Either<E, A>) =>
  (a: A): Either<E, A> =>
    cond(a) ? ifTrue(a) : right<E, A>(a);
