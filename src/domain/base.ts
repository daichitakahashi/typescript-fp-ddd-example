export abstract class Exclusive {
  private internal: undefined;
  constructor() {}
}

export type Props<E extends Exclusive> = Omit<E, 'internal'>;
