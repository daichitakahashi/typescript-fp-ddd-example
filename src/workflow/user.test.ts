import * as f from 'fp-ts/function';
import * as IOE from 'fp-ts/IOEither';
import * as _ from './user';
import {
  InvalidUserEmail,
  InvalidUserName,
  UserId,
  reconstructUser,
} from '../domain/user';

describe('updateUserProfileWorkflow', () => {
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
    const saveUser = jest.fn((events: _.UserEvent[]) => {
      expect(events).toStrictEqual([
        {
          eventName: 'UserProfileUpdated',
          name: 'newUser01',
          email: 'newUser01@example.com',
        } satisfies _.UserProfileUpdated,
      ]);
      return IOE.asUnit(IOE.right(null));
    });

    const updateUserProfile = f.pipe(
      _.updateUserProfileWorkflow,
      f.apply(getUser),
      f.apply(saveUser),
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
      IOE.asUnit(IOE.right<_.IOError, null>(null))(),
    );
    expect(saveUser).toBeCalled();
  });

  it('不正なユーザー名を使ってプロフィールを変更することはできない', () => {
    const updateUserProfile = f.pipe(
      _.updateUserProfileWorkflow,
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
      IOE.left({ type: 'InvalidUserName' } satisfies InvalidUserName)(),
    );
  });

  it('不正なメールアドレスを使ってプロフィールを変更することはできない', () => {
    const updateUserProfile = f.pipe(
      _.updateUserProfileWorkflow,
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
      IOE.left({ type: 'InvalidUserEmail' } satisfies InvalidUserEmail)(),
    );
  });
});

const deepStrictEqual = <A>(actual: A, expected: A) =>
  expect(actual).toStrictEqual(expected);
