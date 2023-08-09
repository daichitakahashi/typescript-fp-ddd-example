const createEntity = <Props>(sym: symbol, props: Props) => ({
  [sym]: true,
  ...props,
});

export { createEntity };
