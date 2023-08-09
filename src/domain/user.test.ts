import { randomUUID } from 'node:crypto';
import { UserId, createUser } from './user';
import { log } from 'node:console';

describe('ユーザーID', () => {
  it('作成したユーザーIDが意図した値を持つ', () => {
    const uuid = '2c7978c0-358c-4ab1-9916-b4adccc394b9';
    const id = UserId.from(uuid);

    expect(id).not.toBeNull();
    expect(id?.value).toEqual(uuid);
  });

  it('UUIDとして不正な文字列からユーザーIDを作成することはできない', () => {
    expect(UserId.from('a-a-a-a-a')).toBeNull();
  });
});

describe('ユーザー作成', () => {
  it('作成したユーザーが意図した値を持つ', () => {
    const user = createUser({
      name: 'user01',
    });

    expect(user).not.toBeNull();
    expect(user?.id).toBeDefined();
    expect(user?.name).toEqual('user01');
  });

  [
    { userName: 'aaaa', success: false }, // length=4
    { userName: 'aaaaa', success: true }, // length=5
    { userName: 'aaaaaaaaaaaaaaaaaaaa', success: true }, // length=20
    { userName: 'aaaaaaaaaaaaaaaaaaaaa', success: false }, // length=21
  ].forEach(({ userName, success }) => {
    const user = createUser({
      name: userName,
    });
    if (success) {
      it(`ユーザー名の長さが${userName.length}のユーザーを作成することができる`, () => {
        expect(user).not.toBeNull();
      });
    } else {
      it(`ユーザー名の長さが${userName.length}のユーザーを作成することはできない`, () => {
        expect(user).toBeNull();
      });
    }
  });
});
