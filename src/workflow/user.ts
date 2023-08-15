import * as f from 'fp-ts/function';
import * as IOE from 'fp-ts/IOEither';
import { User, changeUserName, changeUserEmail, UserId } from '../domain/user';
import { ErrorType } from '../error';

export type IOError = ErrorType<'IOError', { error: Error }>;

export type UserNotFound = ErrorType<'UserNotFound'>;

export type GetUser = (
  id: UserId,
) => IOE.IOEither<IOError | UserNotFound, User>;

export type SaveUser = (user: User) => IOE.IOEither<IOError, User>;

export const updateUserProfile =
  (getUser: GetUser) =>
  (saveUser: SaveUser) =>
  (update: { name: string; email: string }) =>
    f.flow(
      getUser,
      IOE.flatMapEither(changeUserName(update.name)),
      IOE.flatMapEither(changeUserEmail(update.email)),
      IOE.flatMap(saveUser),
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

f.pipe(
  exampleResult,
  IOE.mapError((e) => {
    switch (e.type) {
      case 'IOError':
        break;
      case 'UserNotFound':
        break;
      case 'InvalidUserName':
        break;
      case 'InvalidUserEmail':
        break;
      default:
        const _: never = e;
    }
  }),
);
