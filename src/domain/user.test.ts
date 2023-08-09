import { UserId, type User, createUser } from './user';
import { match } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';

const mustFail = <Right>() =>
  match<Error, Right, void>(
    (e) => {},
    (a) => {
      throw new Error(`unexpected success: ${a}`);
    },
  );

const mustSuccess = <Right>(onRight: (a: Right) => void) =>
  match<Error, Right, void>((e) => {
    throw new Error(`unexpected error: ${e}`);
  }, onRight);

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
      }),
      mustSuccess((user: User) => {
        expect(user.id).toBeDefined();
        expect(user.name).toEqual('user01');
      }),
    );
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
        pipe(
          user,
          mustSuccess((user: User) => expect(user.name).toEqual(userName)),
        );
      });
    } else {
      it(`ユーザー名の長さが${userName.length}のユーザーを作成することはできない`, () => {
        pipe(user, mustFail());
      });
    }
  });
});
