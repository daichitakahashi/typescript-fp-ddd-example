import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import {
  type UserName,
  type UserId,
  type UserEmail,
  reconstructUser,
} from '../../domain/user';
import { createUser, updateUserProfile } from '../../domain/workflow/user';
import { deepStrictEqual, mustRight } from '../../utils/testing';
import { type UserNotFound } from '../user';
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
    const store = new UserStore();
    const userId = '539cd03e-90b3-4183-9000-6239971833b0' as UserId;

    // ユーザー作成
    const createdUser = await deepStrictEqual(
      f.pipe(
        { name: 'user01', email: 'user01@example.com' },
        createUser, // ユーザーを作成
        TE.fromEither,
        TE.flatMap((e) => f.pipe(userId, store.saveUser([e.event]))), // 作成したユーザーを保存
        TE.flatMap(() => f.pipe(userId, store.getUser)), // 保存したユーザーを取得
      )(),
      TE.right(
        reconstructUser({
          id: userId,
          name: 'user01' as UserName,
          email: 'user01@example.com' as UserEmail,
        }),
      )(),
    );

    // ユーザープロフィール更新
    deepStrictEqual(
      f.pipe(
        createdUser,
        mustRight,
        updateUserProfile({
          name: 'newUser01',
          email: 'newUser01@example.com',
        }),
        TE.fromEither,
        TE.flatMap((e) => f.pipe(userId, store.saveUser([e.event]))),
        TE.flatMap(() => f.pipe(userId, store.getUser)), // 保存したユーザーを取得
      )(),
      TE.right(
        reconstructUser({
          id: userId,
          name: 'newUser01' as UserName,
          email: 'newUser01@example.com' as UserEmail,
        }),
      )(),
    );
  });
});
