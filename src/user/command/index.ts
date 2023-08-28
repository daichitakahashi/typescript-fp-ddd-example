import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { type ErrorType } from '@/error';
import { type User, type UserId } from '@/user/domain';
import * as workflow from '@/user/domain/workflow';

export type IOError = ErrorType<'IOError'>;
export type UserNotFound = ErrorType<'UserNotFound'>;

export interface GetUser {
  (userId: UserId): TE.TaskEither<IOError | UserNotFound, User>;
}

export interface SaveUser {
  (
    events: workflow.UserEventType[],
  ): (userId: UserId) => TE.TaskEither<IOError, void>;
}

export const addUser =
  (saveUser: SaveUser) => (props: { name: string; email: string }) =>
    f.pipe(
      props,
      workflow.createUser,
      TE.fromEither,
      TE.flatMap((e) =>
        f.pipe(
          e.artifact.id,
          saveUser([e.event]),
          TE.map(() => e.artifact),
        ),
      ),
    );

export const updateUserProfile =
  (deps: { getUser: GetUser; saveUser: SaveUser }) =>
  (update: { name: string; email: string }) =>
  (userId: UserId) =>
    f.pipe(
      userId,
      deps.getUser,
      TE.flatMap(f.flow(workflow.updateUserProfile(update), TE.fromEither)),
      TE.flatMap((e) =>
        f.pipe(
          e.artifact.id,
          deps.saveUser([e.event]),
          TE.map(() => e.artifact),
        ),
      ),
    );
