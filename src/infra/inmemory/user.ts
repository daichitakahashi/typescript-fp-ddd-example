import * as A from 'fp-ts/Array';
import * as IOE from 'fp-ts/IOEither';
import * as O from 'fp-ts/Option';
import * as f from 'fp-ts/function';
import { match } from 'ts-pattern';
import { reconstructUser, type User, type UserId } from '../../domain/user';
import { type UserEventType } from '../../domain/workflow/user';
import { type UserNotFound, type GetUser, type SaveUser } from '../user';

export class UserStore {
  userSnapshot = new Map<UserId, User>();
  userEvents = new Map<UserId, UserEventType[]>();

  readonly getUser: GetUser = f.flow(
    IOE.right<never, UserId>,
    IOE.bindTo('userId'),
    IOE.bind('snapshot', ({ userId }) =>
      f.pipe(
        userId,
        this.userSnapshot.get,
        O.fromNullable,
        IOE.fromOption(() => ({ type: 'UserNotFound' }) satisfies UserNotFound),
      ),
    ),
    IOE.bindW('events', ({ userId }) =>
      f.pipe(userId, this.userEvents.get, IOE.right),
    ),
    IOE.map(({ snapshot, events }) => replay(events ?? [])(snapshot)),
  );

  readonly saveUser: SaveUser = null as unknown as SaveUser;
}

const replay = (events: UserEventType[]) => (user: User) =>
  f.pipe(
    events,
    A.reduce(user, (curUser, e) =>
      match(e)
        .with({ eventName: 'UserCreated' }, () => curUser)
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
