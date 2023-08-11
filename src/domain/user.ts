import { randomUUID } from 'node:crypto';
import { Either, map } from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import {
  object,
  string,
  minLength,
  maxLength,
  uuid,
  email,
  partial,
} from 'valibot';
import { createEntity, validate, validatePartial } from './base';

const sym = Symbol('user');

const UserIdSchema = string([uuid()]);
class UserId {
  private [sym] = true;
  private constructor(readonly value: string) {}
  static generate(): UserId {
    return new UserId(randomUUID());
  }
  static from(uuid: string): Either<Error, UserId> {
    return pipe(
      uuid,
      validate(UserIdSchema),
      map((validated) => new UserId(validated)),
    );
  }
}

interface UserProps {
  id: UserId;
  name: string;
  email: string;
}
type User = ReturnType<typeof createEntity<UserProps>>;

const UserSchema = partial(
  object({
    name: string([minLength(5), maxLength(20)]),
    email: string([email()]),
  }),
);
const reconstructUser = (props: UserProps): Either<Error, User> =>
  pipe(
    props,
    validate(UserSchema),
    map((validated) =>
      createEntity<UserProps>(sym, {
        ...props,
        ...validated,
      }),
    ),
  );

const createUser = (params: {
  name: string;
  email: string;
}): Either<Error, User> =>
  reconstructUser({
    id: UserId.generate(),
    ...params,
  });

const changeUserName =
  (name: string) =>
  (user: User): Either<Error, User> =>
    pipe(user, validatePartial(UserSchema, 'name', name));

const changeUserEmail =
  (email: string) =>
  (user: User): Either<Error, User> =>
    pipe(user, validatePartial(UserSchema, 'email', email));

export {
  UserId,
  UserProps,
  User,
  createUser,
  reconstructUser,
  changeUserName,
  changeUserEmail,
};
