import crypto from 'node:crypto';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { type UserNotFound } from '../../user/command';
import * as command from '../../user/command';
import {
  type UserName,
  type UserId,
  type UserEmail,
  reconstructUser,
} from '../../user/domain';
import {
  type UserCreated,
  type UserProfileUpdated,
} from '../../user/domain/workflow';
import { deepStrictEqual, mustRight } from '../../utils/testing';
import { UserStore, type CapturedUserEvent } from './user-command';

describe('UserStore', () => {
  it('作成されていないユーザーの取得に失敗する', () => {
    const cdc = jest.fn(() => {
      throw new Error('never thrown'); // ユーザーの取得ではイベントは発生しない。
    });

    const store = new UserStore(cdc);

    deepStrictEqual(
      store.getUser('539cd03e-90b3-4183-9000-6239971833b0' as UserId)(),
      TE.left({ type: 'UserNotFound' } satisfies UserNotFound)(),
    );
  });

  it('ユーザー情報を適切に保存/取得することができる', async () => {
    const userId = '539cd03e-90b3-4183-9000-6239971833b0' as UserId;
    const spy = jest.spyOn(crypto, 'randomUUID');
    spy.mockReturnValue(userId as crypto.UUID);

    // mock for CDC(do nothing)
    const cdc = jest.fn(() => T.of(f.constVoid()));

    const store = new UserStore(cdc);
    const addUser = command.addUser(store.saveUser);
    const updateUserProfile = command.updateUserProfile(store);

    // ユーザー作成
    const createdUser = deepStrictEqual(
      await f.pipe(
        { name: 'user01', email: 'user01@example.com' },
        addUser, // ユーザーを作成
        TE.flatMap(() => f.pipe(userId, store.getUser)), // 保存したユーザーを取得
      )(),
      await TE.right(
        reconstructUser({
          id: userId,
          name: 'user01' as UserName,
          email: 'user01@example.com' as UserEmail,
        }),
      )(),
    );

    // ユーザープロフィール更新
    deepStrictEqual(
      await f.pipe(
        createdUser,
        mustRight,
        (user) => user.id,
        updateUserProfile({
          name: 'newUser01',
          email: 'newUser01@example.com',
        }),
        TE.flatMap((user) =>
          f.pipe(
            user.id,
            updateUserProfile({
              name: 'user02',
              email: 'user02@example.com',
            }),
          ),
        ),
      )(),
      await TE.right(
        reconstructUser({
          id: userId,
          name: 'user02' as UserName,
          email: 'user02@example.com' as UserEmail,
        }),
      )(),
    );

    // キャプチャーしたイベントを確認する。
    expect(cdc.mock.calls).toEqual([
      [
        {
          userId,
          events: [
            {
              eventName: 'UserCreated',
              name: 'user01' as UserName,
              email: 'user01@example.com' as UserEmail,
            } satisfies UserCreated,
          ],
        },
      ],
      [
        {
          userId,
          events: [
            {
              eventName: 'UserProfileUpdated',
              name: 'newUser01' as UserName,
              email: 'newUser01@example.com' as UserEmail,
            } satisfies UserProfileUpdated,
          ],
        },
      ],
      [
        {
          userId,
          events: [
            {
              eventName: 'UserProfileUpdated',
              name: 'user02' as UserName,
              email: 'user02@example.com' as UserEmail,
            } satisfies UserProfileUpdated,
          ],
        },
      ],
    ] satisfies CapturedUserEvent[][]);
  });
});
