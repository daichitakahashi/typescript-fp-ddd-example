import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { match } from 'ts-pattern';
import {
  type UserNotFound,
  type GetUser,
  type SaveUser,
} from '../../user/command';
import { reconstructUser, type User, type UserId } from '../../user/domain';
import { type UserEventType } from '../../user/domain/workflow';
import type * as T from 'fp-ts/Task';

export interface CapturedUserEvent {
  userId: UserId;
  events: UserEventType[];
}

// For local CDC
export interface CaptureUserEvent {
  (e: CapturedUserEvent): T.Task<void>;
}

export class UserStore {
  private userSnapshot = new Map<UserId, User>();
  private userEvents = new Map<UserId, UserEventType[]>();
  constructor(private cdc: CaptureUserEvent) {}

  readonly getUser: GetUser = f.flow(
    TE.right<never, UserId>,
    TE.bindTo('userId'),
    TE.bind('snapshot', ({ userId }) =>
      f.pipe(
        this.userSnapshot.get(userId),
        O.fromNullable,
        TE.fromOption(() => ({ type: 'UserNotFound' }) satisfies UserNotFound),
      ),
    ),
    TE.bindW('events', ({ userId }) =>
      f.pipe(this.userEvents.get(userId), TE.right),
    ),
    TE.map(({ snapshot, events }) => replayUser(events ?? [])(snapshot)),
  );

  readonly saveUser: SaveUser = (events: UserEventType[]) => (userId: UserId) =>
    f.pipe(
      this.userSnapshot.has(userId),
      (exists) =>
        exists
          ? // append events
            f.pipe(
              this.userEvents.get(userId),
              (e) =>
                TE.right(
                  this.userEvents.set(userId, [...(e ?? []), ...events]),
                ),
              TE.asUnit,
            )
          : // save snapshot
            f.pipe(
              { id: userId } as User,
              replayUser(events),
              (user) => TE.right(this.userSnapshot.set(userId, user)),
              TE.asUnit,
            ),
      TE.flatMapTask(() => this.cdc({ userId, events })),
    );
}

const replayUser = (events: UserEventType[]) => (user: User) =>
  f.pipe(
    events,
    A.reduce(user, (curUser, e) =>
      match(e)
        .with({ eventName: 'UserCreated' }, ({ name, email }) =>
          reconstructUser({
            ...curUser,
            name,
            email,
          }),
        )
        .with({ eventName: 'UserProfileUpdated' }, ({ name, email }) =>
          reconstructUser({
            ...curUser,
            name,
            email,
          }),
        )
        .exhaustive(),
    ),
  );
