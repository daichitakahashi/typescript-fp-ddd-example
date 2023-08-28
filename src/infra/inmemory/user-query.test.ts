import { deepStrictEqual } from 'assert';
import * as TE from 'fp-ts/TaskEither';
import { type UserName, type UserEmail, type UserId } from '../../user/domain';
import { type UserCreated } from '../../user/domain/workflow';
import { type User, type UserNotFound } from '../../user/query';
import { UserQuery } from './user-query';

describe('UserQuery', () => {
  it('存在しないユーザーの取得に失敗する', async () => {
    const query = new UserQuery();
    deepStrictEqual(
      await query.findById('not-found')(),
      await TE.left({ type: 'UserNotFound' } satisfies UserNotFound)(),
    );
  });

  it('ユーザーが登録されていない状態でユーザー一覧を取得すると空の配列が返される', async () => {
    const query = new UserQuery();
    deepStrictEqual(await query.list()(), await TE.of([])());
  });

  it('CDCで登録されたユーザー情報を取得することができる', async () => {
    const query = new UserQuery();
    await query.capture({
      userId: 'a46ccd5d-9cd7-469a-bd97-e9dc9d553032' as UserId,
      events: [
        {
          eventName: 'UserCreated',
          name: 'user01' as UserName,
          email: 'user01@example.com' as UserEmail,
        },
        {
          eventName: 'UserProfileUpdated',
          name: 'user02' as UserName,
          email: 'user02@example.com' as UserEmail,
        },
      ],
    })();

    deepStrictEqual(
      await query.findById('a46ccd5d-9cd7-469a-bd97-e9dc9d553032')(),
      await TE.of({
        id: 'a46ccd5d-9cd7-469a-bd97-e9dc9d553032',
        name: 'user02',
        email: 'user02@example.com',
      } satisfies User)(),
    );
  });

  it('CDCで登録されたユーザーの一覧を取得することができる', async () => {
    const query = new UserQuery();
    await query.capture({
      userId: '6d6d5bf0-dc01-4170-b204-10bc1a590514' as UserId,
      events: [
        {
          eventName: 'UserCreated',
          name: 'user01' as UserName,
          email: 'user01@example.com' as UserEmail,
        } satisfies UserCreated,
      ],
    })();
    await query.capture({
      userId: '0eeb4a14-2b6d-48ae-968c-f76b74e373a0' as UserId,
      events: [
        {
          eventName: 'UserCreated',
          name: 'user02' as UserName,
          email: 'user02@example.com' as UserEmail,
        } satisfies UserCreated,
      ],
    })();

    deepStrictEqual(
      await query.list()(),
      await TE.of([
        {
          id: '6d6d5bf0-dc01-4170-b204-10bc1a590514',
          name: 'user01',
          email: 'user01@example.com',
        },
        {
          id: '0eeb4a14-2b6d-48ae-968c-f76b74e373a0',
          name: 'user02',
          email: 'user02@example.com',
        },
      ] satisfies User[])(),
    );
  });
});
