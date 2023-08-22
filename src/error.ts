export type ErrorSet = { type: string };

export type ErrorType<
  Type extends string,
  Props extends object | undefined = undefined,
> = Props extends object
  ? {
      type: Type;
    } & Props
  : { type: Type };
