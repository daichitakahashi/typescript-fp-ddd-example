import * as E from 'fp-ts/Either';
import * as f from 'fp-ts/function';
import {
  type User,
  createUser,
  changeUserName,
  changeUserEmail,
  validateUserId,
  InvalidUserId,
  InvalidUserEmail,
  reconstructUser,
  InvalidUserName,
} from './user';
import { deepStrictEqual, mustRight } from '../utils/testing';

describe('ユーザーID', () => {
  it('作成したユーザーIDが意図した値を持つ', () => {
    deepStrictEqual(
      validateUserId('2c7978c0-358c-4ab1-9916-b4adccc394b9'),
      E.right('2c7978c0-358c-4ab1-9916-b4adccc394b9'),
    );
  });

  it('UUIDとして不正な文字列からユーザーIDを作成することはできない', () => {
    deepStrictEqual(
      validateUserId('a-a-a-a-a'),
      E.left({ type: 'InvalidUserId' } satisfies InvalidUserId),
    );
  });
});

describe('ユーザー作成', () => {
  it('作成したユーザーが意図した値を持つ', () => {
    deepStrictEqual(
      f.pipe(
        createUser({
          name: 'user01',
          email: 'valid@example.com',
        }),
        E.map((user) => {
          expect(user.id).toBeDefined();
          return { name: user.name, email: user.email };
        }),
      ),
      E.right({ name: 'user01', email: 'valid@example.com' }),
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
        deepStrictEqual(
          f.pipe(
            user,
            E.map((user) => ({ name: user.name, email: user.email })),
          ),
          E.right({ name: newName, email: 'valid@example.com' }),
        );
      });
    } else {
      it(`ユーザー名の長さが${newName.length}のユーザーを作成することはできない`, () => {
        deepStrictEqual(
          user,
          E.left({ type: 'InvalidUserName' } satisfies InvalidUserName),
        );
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
        deepStrictEqual(
          f.pipe(
            user,
            E.map((user) => ({ name: user.name, email: user.email })),
          ),
          E.right({ name: 'user01', email: newEmail }),
        );
      });
    } else {
      it(`"${newEmail}"をメールアドレスとして持つユーザーを作成することはできない`, () => {
        deepStrictEqual(
          user,
          E.left({ type: 'InvalidUserEmail' } satisfies InvalidUserEmail),
        );
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
    const user = f.pipe(
      createUser({
        name: 'user01',
        email: 'valid@example.com',
      }),
      mustRight(),
    );
    const result = f.pipe(user, changeUserName(newName));

    if (success) {
      it(`ユーザー名の長さが${newName.length}のユーザーを作成することができる`, () => {
        deepStrictEqual(
          result,
          reconstructUser({
            id: user.id,
            name: newName,
            email: 'valid@example.com',
          }),
        );
      });
    } else {
      it(`ユーザー名の長さが${newName.length}のユーザーを作成することはできない`, () => {
        deepStrictEqual(
          result,
          E.left({ type: 'InvalidUserName' } satisfies InvalidUserName),
        );
      });
    }
  });
});

describe('メールアドレス変更', () => {
  [
    { newEmail: 'valid@example.com', success: true },
    { newEmail: 'invalid_at_example.com', success: false },
  ].forEach(({ newEmail, success }) => {
    const user = f.pipe(
      createUser({
        name: 'user01',
        email: 'valid@example.com',
      }),
      mustRight(),
    );
    const result = f.pipe(user, changeUserEmail(newEmail));

    if (success) {
      it(`"${newEmail}"をメールアドレスとして持つユーザーを作成することができる`, () => {
        deepStrictEqual(
          f.pipe(
            result,
            E.map((user) => ({ name: user.name, email: user.email })),
          ),
          E.right({ name: 'user01', email: newEmail }),
        );
      });
    } else {
      it(`"${newEmail}"をメールアドレスとして持つユーザーを作成することはできない`, () => {
        deepStrictEqual(
          result,
          E.left({ type: 'InvalidUserEmail' } satisfies InvalidUserEmail),
        );
      });
    }
  });
});
