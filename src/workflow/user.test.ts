import * as f from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as _ from './user';
import {
  InvalidUserEmail,
  InvalidUserName,
  UserId,
  reconstructUser,
} from '../domain/user';

describe('createUser', () => {
  it('ユーザーを作成することができる', () => {
    deepStrictEqual(
      _.createUser({ name: 'user01', email: 'user01@example.com' }),
      E.right([
        {
          eventName: 'UserCreated',
          name: 'user01',
          email: 'user01@example.com',
        } satisfies _.UserCreated,
      ]),
    );
  });
});

describe('updateUserProfile', () => {
  it('プロフィールを変更することができる', () => {
    deepStrictEqual(
      f.pipe(
        UserId.from('eb98e96c-f3e0-4416-a358-5b0825506d83'),
        E.flatMap((userId) =>
          reconstructUser({
            id: userId,
            name: 'user01',
            email: 'user01@example.com',
          }),
        ),
        E.flatMap(
          _.updateUserProfile({
            name: 'newUser01',
            email: 'newUser01@example.com',
          }),
        ),
      ),
      E.right([
        {
          eventName: 'UserProfileUpdated',
          name: 'newUser01',
          email: 'newUser01@example.com',
        } satisfies _.UserProfileUpdated,
      ]),
    );
  });

  it('不正なユーザー名を使ってプロフィールを変更することはできない', () => {
    deepStrictEqual(
      f.pipe(
        UserId.from('eb98e96c-f3e0-4416-a358-5b0825506d83'),
        E.flatMap((userId) =>
          reconstructUser({
            id: userId,
            name: 'user01',
            email: 'user01@example.com',
          }),
        ),
        E.flatMap(
          _.updateUserProfile({
            name: 'aaa', // too short
            email: 'newUser01@example.com',
          }),
        ),
      ),
      E.left({ type: 'InvalidUserName' } satisfies InvalidUserName),
    );
  });

  it('不正なメールアドレスを使ってプロフィールを変更することはできない', () => {
    deepStrictEqual(
      f.pipe(
        UserId.from('eb98e96c-f3e0-4416-a358-5b0825506d83'),
        E.flatMap((userId) =>
          reconstructUser({
            id: userId,
            name: 'user01',
            email: 'user01@example.com',
          }),
        ),
        E.flatMap(
          _.updateUserProfile({
            name: 'newUser01',
            email: 'newUser01_at_example.com',
          }),
        ),
      ),
      E.left({ type: 'InvalidUserEmail' } satisfies InvalidUserEmail),
    );
  });
});

const deepStrictEqual = <A>(actual: A, expected: A) =>
  expect(actual).toStrictEqual(expected);
