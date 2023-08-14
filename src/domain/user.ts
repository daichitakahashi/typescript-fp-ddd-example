import { randomUUID } from 'node:crypto';
import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import {
  object,
  string,
  minLength,
  maxLength,
  uuid,
  email,
  partial,
} from 'valibot';
import { conditional, createEntity, validate, validatePartial } from './base';

const sym = Symbol('user');

const UserIdSchema = string([uuid()]);
export class UserId {
  private [sym] = true;
  private constructor(readonly value: string) {}
  static generate(): UserId {
    return new UserId(randomUUID());
  }
  static from(uuid: string): E.Either<Error, UserId> {
    return f.pipe(
      uuid,
      validate(UserIdSchema),
      E.map((validated) => new UserId(validated)),
    );
  }
}

export interface UserProps {
  id: UserId;
  name: string;
  email: string;
}
export type User = ReturnType<typeof createEntity<UserProps>>;

const UserSchema = partial(
  object({
    name: string([minLength(5), maxLength(20)]),
    email: string([email()]),
  }),
);
export const reconstructUser = (props: UserProps): E.Either<Error, User> =>
  f.pipe(
    props,
    validate(UserSchema),
    E.map((validated) =>
      createEntity<UserProps>(sym, {
        ...props,
        ...validated,
      }),
    ),
  );

export const createUser = (params: {
  name: string;
  email: string;
}): E.Either<Error, User> =>
  reconstructUser({
    id: UserId.generate(),
    ...params,
  });

export const changeUserName = (name: string) =>
  conditional<Error, User>(
    (user: User) => user.name !== name,
    validatePartial(UserSchema, 'name', name),
  );

export const changeUserEmail = (email: string) =>
  conditional<Error, User>(
    (user: User) => user.email !== email,
    validatePartial(UserSchema, 'email', email),
  );
