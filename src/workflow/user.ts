import * as f from 'fp-ts/function';
import * as IOE from 'fp-ts/IOEither';
import { User, changeUserName, changeUserEmail, UserId } from '../domain/user';
import { ErrorType } from '../error';

export type IOError = ErrorType<'IOError', { error: Error }>;

export type UserNotFound = ErrorType<'UserNotFound'>;

export type GetUser = (
  id: UserId,
) => IOE.IOEither<IOError | UserNotFound, User>;

export type SaveUser = (user: User) => IOE.IOEither<IOError, User>;

export const updateUserProfile =
  (getUser: GetUser) =>
  (saveUser: SaveUser) =>
  (update: { name: string; email: string }) =>
    f.flow(
      getUser,
      IOE.flatMapEither(changeUserName(update.name)),
      IOE.flatMapEither(changeUserEmail(update.email)),
      IOE.flatMap(saveUser),
    );
