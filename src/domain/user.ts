import { randomUUID } from 'node:crypto';
import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import { Exclusive, type Props } from './base';
import { type ErrorType } from '../error';

type InvalidUserId = ErrorType<'InvalidUserId'>;
const validateUserId = E.fromPredicate(
  (input: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      input,
    ),
  (): InvalidUserId => ({
    type: 'InvalidUserId',
  }),
);

export class UserId extends Exclusive {
  private constructor(readonly value: string) {
    super();
  }
  static generate(): UserId {
    return new UserId(randomUUID());
  }
  static from(uuid: string): E.Either<InvalidUserId, UserId> {
    return f.pipe(
      uuid,
      validateUserId,
      E.map((validated) => new UserId(validated)),
    );
  }
}

export class User extends Exclusive {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  protected constructor(props: UserProps) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
  }
}

export type UserProps = Props<User>;

class UserFactory extends User {
  constructor(props: UserProps) {
    super(props);
  }
  static reconstructUnsafely(props: UserProps): User {
    const u = new UserFactory(props);
    Object.setPrototypeOf(u, User.prototype);
    return u;
  }
}

export type InvalidUserName = ErrorType<'InvalidUserName'>;
const validateUserName = E.fromPredicate(
  (user: User) => 5 <= user.name.length && user.name.length <= 20,
  (): InvalidUserName => ({
    type: 'InvalidUserName',
  }),
);

export type InvalidUserEmail = ErrorType<'InvalidUserEmail'>;
const validateUserEmail = E.fromPredicate(
  (user: User) =>
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(
      user.email,
    ),
  (): InvalidUserEmail => ({
    type: 'InvalidUserEmail',
  }),
);

export const reconstructUser = (props: UserProps) =>
  f.pipe(
    E.right(UserFactory.reconstructUnsafely(props)),
    E.flatMap(validateUserName),
    E.flatMap(validateUserEmail),
  );

export const createUser = (params: { name: string; email: string }) =>
  reconstructUser({
    id: UserId.generate(),
    ...params,
  });

export const changeUserName = (name: string) => (user: User) =>
  f.pipe(UserFactory.reconstructUnsafely({ ...user, name }), validateUserName);

export const changeUserEmail = (email: string) => (user: User) =>
  f.pipe(
    UserFactory.reconstructUnsafely({ ...user, email }),
    validateUserEmail,
  );
