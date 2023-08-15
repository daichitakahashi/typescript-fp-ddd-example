import * as f from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { User, changeUserName, changeUserEmail, UserId } from '../domain/user';

export type GetUser = (id: UserId) => E.Either<Error, User>;

export type SaveUser = (user: User) => E.Either<Error, User>;

export const updateUserProfile =
  (getUser: GetUser) =>
  (saveUser: SaveUser) =>
  (update: { name: string; email: string }) =>
    f.flow(
      getUser,
      E.flatMap(changeUserName(update.name)),
      E.flatMap(changeUserEmail(update.email)),
      E.flatMap(saveUser),
    );

const exampleCall = f.pipe(
  updateUserProfile,
  f.apply(null as unknown as GetUser),
  f.apply(null as unknown as SaveUser),
);
const exampleResult = f.pipe(
  null as unknown as UserId,
  exampleCall({ name: '', email: '' }),
);
