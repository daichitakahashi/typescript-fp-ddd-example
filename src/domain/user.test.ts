import { UserId, type User, createUser, changeUserName } from './user';
import { match } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';

const mustFail = <Right>() =>
  match<Error, Right, Error>(
    (e) => e,
    (a): Error => {
      throw new Error(`unexpected success: ${a}`);
    },
  );

const mustSuccess = <Right>(onRight?: (a: Right) => void) =>
  match<Error, Right, Right>(
    (e) => {
      throw new Error(`unexpected error: ${e}`);
    },
    (user) => {
      if (onRight) onRight(user);
      return user;
    },
  );

describe('ユーザーID', () => {
  it('作成したユーザーIDが意図した値を持つ', () => {
    const uuid = '2c7978c0-358c-4ab1-9916-b4adccc394b9';

    pipe(
      UserId.from(uuid),
      mustSuccess((id: UserId) => expect(id.value).toEqual(uuid)),
    );
  });

  it('UUIDとして不正な文字列からユーザーIDを作成することはできない', () => {
    pipe(UserId.from('a-a-a-a-a'), mustFail());
  });
});

describe('ユーザー作成', () => {
  it('作成したユーザーが意図した値を持つ', () => {
    pipe(
      createUser({
        name: 'user01',
        email: 'valid@example.com',
      }),
      mustSuccess((user: User) => {
        expect(user.id).toBeDefined();
        expect(user.name).toEqual('user01');
      }),
    );
  });

  [
    { newName: 'aaaa', success: false }, // length=4
    { newName: 'aaaaa', success: true }, // length=5
    { newName: 'aaaaaaaaaaaaaaaaaaaa', success: true }, // length=20
    { newName: 'aaaaaaaaaaaaaaaaaaaaa', success: false }, // length=21
  ].forEach(({ newName, success }) => {
    const user = createUser({
      name: newName,
      email: 'valid@example.com',
    });
    if (success) {
      it(`ユーザー名の長さが${newName.length}のユーザーを作成することができる`, () => {
        pipe(
          user,
          mustSuccess((created: User) =>
            expect(created).toMatchObject({
              name: newName,
              email: 'valid@example.com',
            }),
          ),
        );
      });
    } else {
      it(`ユーザー名の長さが${newName.length}のユーザーを作成することはできない`, () => {
        pipe(user, mustFail());
      });
    }
  });

  [
    { newEmail: 'valid@example.com', success: true },
    { newEmail: 'invalid_at_example.com', success: false },
  ].forEach(({ newEmail, success }) => {
    const user = createUser({
      name: 'user01',
      email: newEmail,
    });
    if (success) {
      it(`"${newEmail}"をメールアドレスとして持つユーザーを作成することができる`, () => {
        pipe(
          user,
          mustSuccess((created: User) =>
            expect(created).toMatchObject({
              name: 'user01',
              email: newEmail,
            }),
          ),
        );
      });
    } else {
      it(`${newEmail}をメールアドレスとして持つユーザーを作成することはできない`, () => {
        pipe(user, mustFail());
      });
    }
  });
});

describe('ユーザー名変更', () => {
  [
    { newName: 'aaaa', success: false }, // length=4
    { newName: 'aaaaa', success: true }, // length=5
    { newName: 'aaaaaaaaaaaaaaaaaaaa', success: true }, // length=20
    { newName: 'aaaaaaaaaaaaaaaaaaaaa', success: false }, // length=21
  ].forEach(({ newName, success }) => {
    const user = pipe(
      createUser({
        name: 'user01',
        email: 'valid@example.com',
      }),
      mustSuccess(),
    );
    const result = pipe(user, changeUserName(newName));

    if (success) {
      it(`ユーザー名の長さが${newName.length}のユーザーを作成することができる`, () => {
        pipe(
          result,
          mustSuccess((updated: User) =>
            expect(updated).toMatchObject({
              id: user.id,
              name: newName,
              email: 'valid@example.com',
            }),
          ),
        );
      });
    } else {
      it(`ユーザー名の長さが${newName.length}のユーザーを作成することはできない`, () => {
        pipe(result, mustFail());
      });
    }
  });
});
