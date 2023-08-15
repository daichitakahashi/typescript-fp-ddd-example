export type ErrorSet = { type: string };

export type ErrorType<
  Type extends string,
  Props extends {} | undefined = undefined,
> = Props extends {}
  ? {
      type: Type;
    } & Props
  : { type: Type };
