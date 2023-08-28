import type * as TE from 'fp-ts/TaskEither';
import { type ErrorType } from '@/error';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type IOError = ErrorType<
  'IOError',
  {
    error: Error;
  }
>;
export type UserNotFound = ErrorType<'UserNotFound'>;

export interface UserQuery {
  findById(userId: string): TE.TaskEither<IOError | UserNotFound, User>;
  list(): TE.TaskEither<IOError, User[]>;
}
