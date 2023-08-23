import { type User, type UserId } from '../domain/user';
import { type UserEventType } from '../domain/workflow/user';
import { type ErrorType } from '../error';
import type * as IOE from 'fp-ts/IOEither';

export type IOError = ErrorType<'IOError'>;
export type UserNotFound = ErrorType<'UserNotFound'>;

export interface GetUser {
  (userId: UserId): IOE.IOEither<IOError | UserNotFound, User>;
}

export interface SaveUser {
  (events: UserEventType[]): (userId: UserId) => IOE.IOEither<IOError, void>;
}
