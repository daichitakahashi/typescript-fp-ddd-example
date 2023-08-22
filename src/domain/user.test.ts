import crypto from 'node:crypto';
import * as E from 'fp-ts/Either';
import {
  createUser,
  validateUserId,
  InvalidUserId,
  InvalidUserName,
  InvalidUserEmail,
  reconstructUser,
  UserName,
  UserEmail,
  UserId,
  validateUserName,
  validateUserEmail,
} from './user';
import { deepStrictEqual } from '../utils/testing';

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

describe('ユーザー名', () => {
  [
    { newName: 'aaaa', success: false }, // length=4
    { newName: 'aaaaa', success: true }, // length=5
    { newName: 'aaaaaaaaaaaaaaaaaaaa', success: true }, // length=20
    { newName: 'aaaaaaaaaaaaaaaaaaaaa', success: false }, // length=21
  ].forEach(({ newName, success }) => {
    if (success) {
      it(`長さが${newName.length}のユーザー名は妥当である`, () => {
        deepStrictEqual(validateUserName(newName), E.right(newName));
      });
    } else {
      it(`長さが${newName.length}のユーザー名は不正である`, () => {
        deepStrictEqual(
          validateUserName(newName),
          E.left({ type: 'InvalidUserName' } satisfies InvalidUserName),
        );
      });
    }
  });
});

describe('ユーザーメールアドレス', () => {
  [
    { newEmail: 'valid@example.com', success: true },
    { newEmail: 'invalid_at_example.com', success: false },
  ].forEach(({ newEmail, success }) => {
    if (success) {
      it(`"${newEmail}"はメールアドレスとして妥当である`, () => {
        deepStrictEqual(validateUserEmail(newEmail), E.right(newEmail));
      });
    } else {
      it(`"${newEmail}"はメールアドレスとして不正である`, () => {
        deepStrictEqual(
          validateUserEmail(newEmail),
          E.left({ type: 'InvalidUserEmail' } satisfies InvalidUserEmail),
        );
      });
    }
  });
});

describe('ユーザー作成', () => {
  beforeEach(() => {
    const spy = jest.spyOn(crypto, 'randomUUID');
    spy.mockReturnValue('5687625b-ecae-41e5-bb89-15fcc7d8c47e');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('作成したユーザーが期待された値を持つ', () => {
    expect(
      createUser({
        name: 'user01' as UserName,
        email: 'valid@example.com' as UserEmail,
      }),
    ).toMatchObject({
      id: '5687625b-ecae-41e5-bb89-15fcc7d8c47e' as UserId,
      name: 'user01' as UserName,
      email: 'valid@example.com' as UserEmail,
    });
  });

  it('再構築したユーザーが期待された値を持つ', () => {
    expect(
      reconstructUser({
        id: '5687625b-ecae-41e5-bb89-15fcc7d8c47e' as UserId,
        name: 'user01' as UserName,
        email: 'valid@example.com' as UserEmail,
      }),
    ).toMatchObject({
      id: '5687625b-ecae-41e5-bb89-15fcc7d8c47e',
      name: 'user01',
      email: 'valid@example.com',
    });
  });
});
