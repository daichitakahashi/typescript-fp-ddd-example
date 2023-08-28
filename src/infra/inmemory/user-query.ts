import * as I from 'fp-ts/Identity';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import * as f from 'fp-ts/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { match } from 'ts-pattern';
import { type CaptureUserEvent } from './user-command';
import type * as _ from '../../user/query';

export class UserQuery implements _.UserQuery {
  private users = new Map<string, _.User>();

  findById(userId: string) {
    return f.pipe(
      this.users.get(userId),
      O.fromNullable,
      TE.fromOption(() => ({ type: 'UserNotFound' }) satisfies _.UserNotFound),
    );
  }

  list() {
    return TE.of([...this.users.values()]);
  }

  capture: CaptureUserEvent = ({ userId, events }) => {
    return f.pipe(
      this.users.get(userId),
      O.fromNullable,
      O.match(
        () => ({ id: userId, name: '', email: '' }) satisfies _.User,
        I.of,
      ),
      (user) =>
        events.reduce(
          (acc, e) =>
            match(e)
              .with({ eventName: 'UserCreated' }, ({ name, email }) => ({
                ...acc,
                name,
                email,
              }))
              .with({ eventName: 'UserProfileUpdated' }, ({ name, email }) => ({
                ...acc,
                name,
                email,
              }))
              .exhaustive(),
          user,
        ),
      (user) => this.users.set(userId, user),
      () => T.of(f.constVoid()),
    );
  };
}
