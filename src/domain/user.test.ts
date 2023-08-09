import { randomUUID } from 'node:crypto';
import { UserId, createUser } from './user';
import { log } from 'node:console';

describe('ユーザーID', () => {
  it('作成したユーザーIDが意図した値を持つ', () => {
    const uuid = randomUUID();
    const id = UserId.from(uuid);

    expect(id.value).toEqual(uuid);
  });
});

describe('ユーザー', () => {
  it('作成したユーザーが意図した値を持つ', () => {
    const user = createUser({
      name: 'user01',
    });

    expect(user.id).toBeDefined();
    log(user.id.value);
    expect(user.name).toEqual('user01');
  });
});
