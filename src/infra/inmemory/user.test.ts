import * as IOE from 'fp-ts/IOEither';
import * as f from 'fp-ts/function';
import {
  type UserName,
  type UserId,
  type UserEmail,
  reconstructUser,
} from '../../domain/user';
import {
  type UserProfileUpdated,
  type UserCreated,
} from '../../domain/workflow/user';
import { deepStrictEqual } from '../../utils/testing';
import { type UserNotFound } from '../user';
import { UserStore } from './user';

describe('UserStore', () => {
  it('作成されていないユーザーの取得に失敗する', () => {
    const store = new UserStore();

    deepStrictEqual(
      store.getUser('539cd03e-90b3-4183-9000-6239971833b0' as UserId)(),
      IOE.left({ type: 'UserNotFound' } satisfies UserNotFound)(),
    );
  });

  it('ユーザー情報を適切に保存/取得することができる', () => {
    const store = new UserStore();
    const userId = '539cd03e-90b3-4183-9000-6239971833b0' as UserId;

    // ユーザー作成
    deepStrictEqual(
      f.pipe(
        [
          {
            eventName: 'UserCreated',
            name: 'user01' as UserName,
            email: 'user01@example.com' as UserEmail,
          } satisfies UserCreated,
        ],
        store.saveUser, // ユーザーを作成
        f.apply(userId),
        IOE.flatMap(() => f.pipe(userId, store.getUser)), // 作成したユーザーを取得
      )(),
      IOE.right(
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
        [
          {
            eventName: 'UserProfileUpdated',
            name: 'newUser01' as UserName,
            email: 'newUser01@example.com' as UserEmail,
          } satisfies UserProfileUpdated,
        ],
        store.saveUser, // ユーザーの更新を保存
        f.apply(userId),
        IOE.flatMap(() => f.pipe(userId, store.getUser)), // 保存したユーザーを取得
      )(),
      IOE.right(
        reconstructUser({
          id: userId,
          name: 'newUser01' as UserName,
          email: 'newUser01@example.com' as UserEmail,
        }),
      )(),
    );
  });
});
