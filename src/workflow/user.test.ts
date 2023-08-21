import * as f from 'fp-ts/function';
import * as IOE from 'fp-ts/IOEither';
import * as _ from './user';
import { UserId, User, reconstructUser } from '../domain/user';

describe('updateUserProfile', () => {
  const getUser = (id: UserId) =>
    f.pipe(
      IOE.fromEither(
        reconstructUser({
          id,
          name: 'user01',
          email: 'user01@example.com',
        }),
      ),
      IOE.mapError((e): _.UserNotFound => {
        throw new Error(`unreachable code: ${e}`);
      }),
    );

  it('プロフィールを変更することができる', () => {
    const updateUserProfile = f.pipe(
      _.updateUserProfile,
      f.apply(getUser),
      f.apply((user: User) => IOE.right(user)),
    );

    deepStrictEqual(
      f.pipe(
        IOE.fromEither(UserId.from('eb98e96c-f3e0-4416-a358-5b0825506d83')),
        IOE.flatMap(
          updateUserProfile({
            name: 'newUser01',
            email: 'newUser01@example.com',
          }),
        ),
      )(),
      f.pipe(
        IOE.fromEither(UserId.from('eb98e96c-f3e0-4416-a358-5b0825506d83')),
        IOE.flatMapEither((id) =>
          reconstructUser({
            id: id,
            name: 'newUser01',
            email: 'newUser01@example.com',
          }),
        ),
      )(),
    );
  });

  it('不正なユーザー名を使ってプロフィールを変更することはできない', () => {
    const updateUserProfile = f.pipe(
      _.updateUserProfile,
      f.apply(getUser),
      f.apply(() => {
        throw new Error('unreachable!');
      }),
    );

    deepStrictEqual(
      f.pipe(
        IOE.fromEither(UserId.from('eb98e96c-f3e0-4416-a358-5b0825506d83')),
        IOE.flatMap(
          updateUserProfile({
            name: 'aaa', // too short
            email: 'newUser01@example.com',
          }),
        ),
      )(),
      IOE.left({ type: 'InvalidUserName' } as const)(),
    );
  });

  it('不正なメールアドレスを使ってプロフィールを変更することはできない', () => {
    const updateUserProfile = f.pipe(
      _.updateUserProfile,
      f.apply(getUser),
      f.apply(() => {
        throw new Error('unreachable!');
      }),
    );

    deepStrictEqual(
      f.pipe(
        IOE.fromEither(UserId.from('eb98e96c-f3e0-4416-a358-5b0825506d83')),
        IOE.flatMap(
          updateUserProfile({
            name: 'newUser01',
            email: 'newUser01_at_example.com',
          }),
        ),
      )(),
      IOE.left({ type: 'InvalidUserEmail' } as const)(),
    );
  });
});

const deepStrictEqual = <A>(actual: A, expected: A) =>
  expect(actual).toStrictEqual(expected);
