import { randomUUID } from 'node:crypto';
import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import { createEntity } from './base';
import { ErrorType } from '../error';

const sym = Symbol('user');

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

export class UserId {
  private [sym] = true;
  private constructor(readonly value: string) {}
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

export interface UserProps {
  id: UserId;
  name: string;
  email: string;
}
export type User = ReturnType<typeof createEntity<UserProps>>;

export type InvalidUserName = ErrorType<'InvalidUserName'>;
const validateUserName = E.fromPredicate(
  (props: UserProps) => 5 <= props.name.length && props.name.length <= 20,
  (): InvalidUserName => ({
    type: 'InvalidUserName',
  }),
);

export type InvalidUserEmail = ErrorType<'InvalidUserEmail'>;
const validateUserEmail = E.fromPredicate(
  (props: UserProps) =>
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(
      props.email,
    ),
  (): InvalidUserEmail => ({
    type: 'InvalidUserEmail',
  }),
);

export const reconstructUser = (
  props: UserProps,
): E.Either<InvalidUserName | InvalidUserEmail, User> =>
  f.pipe(
    props,
    validateUserName,
    E.flatMap(validateUserEmail),
    E.map((validated) =>
      createEntity<UserProps>(sym, {
        ...props,
        ...validated,
      }),
    ),
  );

export const createUser = (params: { name: string; email: string }) =>
  reconstructUser({
    id: UserId.generate(),
    ...params,
  });

export const changeUserName = (name: string) => (user: User) =>
  f.pipe({ ...user, name } as User, validateUserName);

export const changeUserEmail = (email: string) => (user: User) =>
  f.pipe({ ...user, email } as User, validateUserEmail);
