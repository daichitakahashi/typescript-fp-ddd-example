import { left, right, type Either } from 'fp-ts/Either';
import { parse, type BaseSchema, type Output } from 'valibot';

const createEntity = <Props>(sym: symbol, props: Props) => ({
  [sym]: true,
  ...props,
});

const validate =
  <Schema extends BaseSchema<any, any>>(schema: Schema) =>
  (input: Output<Schema>): Either<Error, Output<Schema>> => {
    try {
      const output = parse(schema, input);
      return right(output);
    } catch (err: any) {
      return left(err as Error);
    }
  };

export { createEntity, validate };
