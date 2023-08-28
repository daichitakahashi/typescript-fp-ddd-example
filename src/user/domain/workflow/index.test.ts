import crypto from 'node:crypto';
import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import * as _ from './';
import {
  type InvalidUserEmail,
  type InvalidUserName,
  type UserEmail,
  type UserId,
  type UserName,
  reconstructUser,
} from '@/user/domain';
import { deepStrictEqual } from '@/utils/testing';

describe('createUser', () => {
  it('ユーザーを作成することができる', () => {
    const spy = jest.spyOn(crypto, 'randomUUID');
    spy.mockReturnValue('5687625b-ecae-41e5-bb89-15fcc7d8c47e');

    deepStrictEqual(
      _.createUser({ name: 'user01', email: 'user01@example.com' }),
      E.right({
        artifact: reconstructUser({
          id: '5687625b-ecae-41e5-bb89-15fcc7d8c47e' as UserId,
          name: 'user01' as UserName,
          email: 'user01@example.com' as UserEmail,
        }),
        event: {
          eventName: 'UserCreated',
          name: 'user01' as UserName,
          email: 'user01@example.com' as UserEmail,
        },
      } satisfies _.UserEvent),
    );
  });

  it('不正なユーザー名をもつユーザーを作成することはできない', () => {
    deepStrictEqual(
      _.createUser({
        name: 'aaaa', // too short
        email: 'user01@example.com',
      }),
      E.left({ type: 'InvalidUserName' } satisfies InvalidUserName),
    );
  });

  it('不正なメールアドレスをもつユーザーを作成することはできない', () => {
    deepStrictEqual(
      _.createUser({
        name: 'user01',
        email: 'user01_at_example.com',
      }),
      E.left({ type: 'InvalidUserEmail' } satisfies InvalidUserEmail),
    );
  });
});

describe('updateUserProfile', () => {
  it('プロフィールを変更することができる', () => {
    deepStrictEqual(
      f.pipe(
        reconstructUser({
          id: 'fcea5e62-37d4-415e-8e44-2207389b7bc6' as UserId,
          name: 'user01' as UserName,
          email: 'user01@example.com' as UserEmail,
        }),
        _.updateUserProfile({
          name: 'newUser01',
          email: 'newUser01@example.com',
        }),
      ),
      E.right({
        artifact: reconstructUser({
          id: 'fcea5e62-37d4-415e-8e44-2207389b7bc6' as UserId,
          name: 'newUser01' as UserName,
          email: 'newUser01@example.com' as UserEmail,
        }),
        event: {
          eventName: 'UserProfileUpdated',
          name: 'newUser01' as UserName,
          email: 'newUser01@example.com' as UserEmail,
        } satisfies _.UserProfileUpdated,
      } satisfies _.UserEvent),
    );
  });

  it('不正なユーザー名を使ってプロフィールを変更することはできない', () => {
    deepStrictEqual(
      f.pipe(
        reconstructUser({
          id: 'fcea5e62-37d4-415e-8e44-2207389b7bc6' as UserId,
          name: 'user01' as UserName,
          email: 'user01@example.com' as UserEmail,
        }),
        _.updateUserProfile({
          name: 'aaaa', // too short
          email: 'newUser01@example.com',
        }),
      ),
      E.left({ type: 'InvalidUserName' } satisfies InvalidUserName),
    );
  });

  it('不正なメールアドレスを使ってプロフィールを変更することはできない', () => {
    deepStrictEqual(
      f.pipe(
        reconstructUser({
          id: 'fcea5e62-37d4-415e-8e44-2207389b7bc6' as UserId,
          name: 'user01' as UserName,
          email: 'user01@example.com' as UserEmail,
        }),
        _.updateUserProfile({
          name: 'newUser01',
          email: 'newUser01_at_example.com',
        }),
      ),
      E.left({ type: 'InvalidUserEmail' } satisfies InvalidUserEmail),
    );
  });
});
