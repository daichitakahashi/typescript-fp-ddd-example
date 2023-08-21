import * as f from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as IOE from 'fp-ts/IOEither';
import {
  User,
  createUser,
  changeUserName,
  changeUserEmail,
  UserId,
} from '../domain/user';
import { ErrorType } from '../error';

export type IOError = ErrorType<'IOError', { error: Error }>;
export type UserNotFound = ErrorType<'UserNotFound'>;

export type GetUser = (
  id: UserId,
) => IOE.IOEither<IOError | UserNotFound, User>;
export type SaveUser = (events: UserEvent[]) => IOE.IOEither<IOError, void>;

export type UserCreated = Readonly<{
  eventName: 'UserCreated';
  name: string;
  email: string;
}>;
export type UserProfileUpdated = Readonly<{
  eventName: 'UserProfileUpdated';
  name: string;
  email: string;
}>;
export type UserEvent = UserCreated | UserProfileUpdated;

export const createUserWorkflow = (saveUser: SaveUser) =>
  f.flow(
    createUser,
    E.map((user) => [
      {
        eventName: 'UserCreated',
        name: user.name,
        email: user.email,
      } satisfies UserCreated,
    ]),
    IOE.fromEither,
    IOE.flatMap(saveUser),
  );

export const updateUserProfileWorkflow =
  (getUser: GetUser) =>
  (saveUser: SaveUser) =>
  (update: { name: string; email: string }) =>
    f.flow(
      getUser,
      IOE.flatMapEither(changeUserName(update.name)),
      IOE.flatMapEither(changeUserEmail(update.email)),
      IOE.map((user) => [
        {
          eventName: 'UserProfileUpdated',
          name: user.name,
          email: user.email,
        } satisfies UserProfileUpdated,
      ]),
      IOE.flatMap(saveUser),
    );
