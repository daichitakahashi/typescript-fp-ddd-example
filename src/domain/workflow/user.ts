import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import * as _ from '../user';

export type UserCreated = Readonly<{
  eventName: 'UserCreated';
  name: _.UserName;
  email: _.UserEmail;
}>;
export type UserProfileUpdated = Readonly<{
  eventName: 'UserProfileUpdated';
  name: _.UserName;
  email: _.UserEmail;
}>;
export type UserEvent = {
  artifact: _.User;
  event: UserEventType;
};
export type UserEventType = UserCreated | UserProfileUpdated;

export const createUser = (props: { name: string; email: string }) =>
  f.pipe(
    E.Do,
    E.bind('p', () => E.right(props)),
    E.bindW('name', ({ p: { name } }) => _.validateUserName(name)),
    E.bindW('email', ({ p: { email } }) => _.validateUserEmail(email)),
    E.map(({ name, email }) => _.createUser({ name, email })),
    E.map(
      (user) =>
        ({
          artifact: user,
          event: {
            eventName: 'UserCreated',
            name: user.name,
            email: user.email,
          } satisfies UserCreated,
        }) satisfies UserEvent,
    ),
  );

export const updateUserProfile =
  (update: { name: string; email: string }) => (user: _.User) =>
    f.pipe(
      E.Do,
      E.bind('u', () => E.right(update)),
      E.bindW('name', ({ u: { name } }) => _.validateUserName(name)),
      E.bindW('email', ({ u: { email } }) => _.validateUserEmail(email)),
      E.map(({ name, email }) => _.reconstructUser({ ...user, name, email })),
      E.map(
        (user) =>
          ({
            artifact: user,
            event: {
              eventName: 'UserProfileUpdated',
              name: user.name,
              email: user.email,
            } satisfies UserProfileUpdated,
          }) satisfies UserEvent,
      ),
    );
