import { randomUUID } from 'node:crypto';
import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import { Exclusive, reconstructFunc, type Props } from './base';
import { type ErrorType } from '../error';

export type UserId = string & { readonly __brand: unique symbol };

type InvalidUserId = ErrorType<'InvalidUserId'>;
export const validateUserId = f.flow(
  E.fromPredicate(
    (input: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        input,
      ),
    (): InvalidUserId => ({
      type: 'InvalidUserId',
    }),
  ),
  E.map((validated: string) => validated as UserId),
);

const generateUserId = () => randomUUID() as UserId;

export class User extends Exclusive {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  private constructor(props: UserProps) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
  }
}

export type UserProps = Props<User>;

const reconstructUserUnsafely = reconstructFunc<User, typeof User>(User);

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
    E.right(reconstructUserUnsafely(props)),
    E.flatMap(validateUserName),
    E.flatMap(validateUserEmail),
  );

export const createUser = (params: { name: string; email: string }) =>
  reconstructUser({
    id: generateUserId(),
    ...params,
  });

export const changeUserName = (name: string) => (user: User) =>
  f.pipe(reconstructUserUnsafely({ ...user, name }), validateUserName);

export const changeUserEmail = (email: string) => (user: User) =>
  f.pipe(reconstructUserUnsafely({ ...user, email }), validateUserEmail);
