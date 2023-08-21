import * as f from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as _ from '../domain/user';

export type UserCreated = Readonly<{
  eventName: 'UserCreated';
  name: string;
  email: string;
}>;
export type UserProfileUpdated = Readonly<{
  eventName: 'UserProfileUpdated';
  name: string;
  email: string;
}>;
export type UserEvent = UserCreated | UserProfileUpdated;

export const createUser = f.flow(
  _.createUser,
  E.map((user) => [
    {
      eventName: 'UserCreated',
      name: user.name,
      email: user.email,
    } satisfies UserCreated,
  ]),
);

export const updateUserProfile = (update: { name: string; email: string }) =>
  f.flow(
    _.changeUserName(update.name),
    E.flatMap(_.changeUserEmail(update.email)),
    E.map((user) => [
      {
        eventName: 'UserProfileUpdated',
        name: user.name,
        email: user.email,
      } satisfies UserProfileUpdated,
    ]),
  );
