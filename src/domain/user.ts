import { UUID, randomUUID } from 'node:crypto';
import { object, string, minLength, maxLength, uuid } from 'valibot';
import { createEntity, validate } from './base';

const sym = Symbol('user');

const UserIdSchema = object({
  value: string([uuid()]),
});
class UserId {
  private [sym] = true;
  private constructor(readonly value: UUID) {}
  static generate(): UserId {
    return new UserId(randomUUID());
  }
  static from(uuid: UUID): UserId | null {
    if (
      validate(UserIdSchema, {
        value: uuid,
      })
    ) {
      return null;
    }
    return new UserId(uuid);
  }
}

interface UserProps {
  id: UserId;
  name: string;
}
type User = ReturnType<typeof createEntity<UserProps>>;

const UserSchema = object({
  name: string([minLength(5), maxLength(20)]),
});
const reconstructUser = (props: UserProps): User | null => {
  if (validate(UserSchema, props)) return null;
  return createEntity<UserProps>(sym, {
    ...props,
  });
};

const createUser = (params: { name: string }): User | null =>
  reconstructUser({
    id: UserId.generate(),
    ...params,
  });

const changeUserName =
  (name: string) =>
  (user: User): User | null =>
    reconstructUser({
      ...user,
      name,
    });

export { UserId, UserProps, createUser, reconstructUser, changeUserName };
