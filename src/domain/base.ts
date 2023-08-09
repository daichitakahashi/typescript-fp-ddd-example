import { parse, BaseSchema, Output } from 'valibot';

const createEntity = <Props>(sym: symbol, props: Props) => ({
  [sym]: true,
  ...props,
});

const validate = <Schema extends BaseSchema<any, any>>(
  s: Schema,
  o: Output<Schema>,
) => {
  try {
    parse(s, o);
  } catch (e) {
    return e;
  }
  return null;
};

export { createEntity, validate };
