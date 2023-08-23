import { type User, type UserId } from '../domain/user';
import { type UserEventType } from '../domain/workflow/user';
import { type ErrorType } from '../error';
import type * as TE from 'fp-ts/TaskEither';

export type IOError = ErrorType<'IOError'>;
export type UserNotFound = ErrorType<'UserNotFound'>;

export interface GetUser {
  (userId: UserId): TE.TaskEither<IOError | UserNotFound, User>;
}

export interface SaveUser {
  (events: UserEventType[]): (userId: UserId) => TE.TaskEither<IOError, void>;
}
