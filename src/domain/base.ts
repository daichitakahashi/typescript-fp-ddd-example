export abstract class Exclusive {
  private internal: undefined;
  constructor() {}
}

export type Props<E extends Exclusive> = Omit<E, 'internal'>;

interface classType<T> {
  prototype: T;
}

export const reconstructFunc = <T extends Exclusive, TT extends classType<T>>(
  target: TT,
) => {
  // ugly hack
  const constructor = Object.getOwnPropertyDescriptor(
    target.prototype,
    'constructor',
  )?.value;
  return (props: Props<T>) => new constructor(props) as T;
};
