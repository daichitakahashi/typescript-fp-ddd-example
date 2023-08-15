import * as f from 'fp-ts/function';
import * as IE from 'fp-ts/IOEither';
import { User, changeUserName, changeUserEmail, UserId } from '../domain/user';

export type GetUser = (id: UserId) => IE.IOEither<Error, User>;

export type SaveUser = (user: User) => IE.IOEither<Error, User>;

export const updateUserProfile =
  (getUser: GetUser) =>
  (saveUser: SaveUser) =>
  (update: { name: string; email: string }) =>
    f.flow(
      getUser,
      IE.flatMapEither(changeUserName(update.name)),
      IE.flatMapEither(changeUserEmail(update.email)),
      IE.flatMap(saveUser),
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
