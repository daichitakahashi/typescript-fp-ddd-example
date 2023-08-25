import { randomUUID } from 'node:crypto';
import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import { type ErrorType } from '../../error';
import { Exclusive, reconstructFunc, type Props } from './base';

export type UserId = string & { readonly __brand: unique symbol };

export type InvalidUserId = ErrorType<'InvalidUserId'>;
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
  readonly name: UserName;
  readonly email: UserEmail;
  private constructor(props: UserProps) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
  }
}

export type UserProps = Props<User>;

const reconstructUserUnsafely = reconstructFunc<User, typeof User>(User);

export type UserName = string & { readonly __brand: unique symbol };

export type InvalidUserName = ErrorType<'InvalidUserName'>;
export const validateUserName = f.flow(
  E.fromPredicate(
    (name: string) => 5 <= name.length && name.length <= 20,
    (): InvalidUserName => ({
      type: 'InvalidUserName',
    }),
  ),
  E.map((validated: string) => validated as UserName),
);

export type UserEmail = string & { readonly __brand: unique symbol };

export type InvalidUserEmail = ErrorType<'InvalidUserEmail'>;
export const validateUserEmail = f.flow(
  E.fromPredicate(
    (email: string) =>
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(
        email,
      ),
    (): InvalidUserEmail => ({
      type: 'InvalidUserEmail',
    }),
  ),
  E.map((validated: string) => validated as UserEmail),
);

export const reconstructUser = (props: UserProps) =>
  reconstructUserUnsafely(props);

export const createUser = (params: { name: UserName; email: UserEmail }) =>
  reconstructUser({
    id: generateUserId(),
    ...params,
  });
