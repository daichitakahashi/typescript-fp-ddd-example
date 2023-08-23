import * as A from 'fp-ts/Array';
import * as IOE from 'fp-ts/IOEither';
import * as O from 'fp-ts/Option';
import * as f from 'fp-ts/function';
import { match } from 'ts-pattern';
import { reconstructUser, type User, type UserId } from '../../domain/user';
import { type UserEventType } from '../../domain/workflow/user';
import { type UserNotFound, type GetUser, type SaveUser } from '../user';

export class UserStore {
  private userSnapshot = new Map<UserId, User>();
  private userEvents = new Map<UserId, UserEventType[]>();

  readonly getUser: GetUser = f.flow(
    IOE.right<never, UserId>,
    IOE.bindTo('userId'),
    IOE.bind('snapshot', ({ userId }) =>
      f.pipe(
        this.userSnapshot.get(userId),
        O.fromNullable,
        IOE.fromOption(() => ({ type: 'UserNotFound' }) satisfies UserNotFound),
      ),
    ),
    IOE.bindW('events', ({ userId }) =>
      f.pipe(this.userEvents.get(userId), IOE.right),
    ),
    IOE.map(({ snapshot, events }) => replayUser(events ?? [])(snapshot)),
  );

  readonly saveUser: SaveUser = (events: UserEventType[]) => (userId: UserId) =>
    f.pipe(this.userSnapshot.has(userId), (exists) =>
      exists
        ? // append events
          f.pipe(
            this.userEvents.get(userId),
            (e) =>
              IOE.right(this.userEvents.set(userId, [...(e ?? []), ...events])),
            IOE.asUnit,
          )
        : // save snapshot
          f.pipe(
            events,
            replayUser,
            f.apply({ id: userId } as User),
            (user) => IOE.right(this.userSnapshot.set(userId, user)),
            IOE.asUnit,
          ),
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
