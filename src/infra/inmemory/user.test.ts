import crypto from 'node:crypto';
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
import { deepStrictEqual, mustRight } from '../../utils/testing';
import { UserStore } from './user';

describe('UserStore', () => {
  it('作成されていないユーザーの取得に失敗する', () => {
    const store = new UserStore();

    deepStrictEqual(
      store.getUser('539cd03e-90b3-4183-9000-6239971833b0' as UserId)(),
      TE.left({ type: 'UserNotFound' } satisfies UserNotFound)(),
    );
  });

  it('ユーザー情報を適切に保存/取得することができる', async () => {
    const userId = '539cd03e-90b3-4183-9000-6239971833b0' as UserId;
    const spy = jest.spyOn(crypto, 'randomUUID');
    spy.mockReturnValue(userId as crypto.UUID);

    const store = new UserStore();
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
  });
});
