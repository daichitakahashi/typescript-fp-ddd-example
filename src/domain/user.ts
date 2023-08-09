import { UUID, randomUUID } from 'node:crypto';
import { createEntity } from './base';

const sym = Symbol('user');

class UserId {
  private [sym] = true;
  private constructor(readonly value: UUID) {}
  static from(uuid: UUID): UserId {
    return new UserId(uuid);
  }
}

interface UserProps {
  id: UserId;
  name: string;
}

type User = ReturnType<typeof createEntity<UserProps>>;

const createUser = (params: { name: string }): User =>
  createEntity<UserProps>(sym, {
    id: UserId.from(randomUUID()),
    ...params,
  });

const reconstructUser = (props: UserProps): User =>
  createEntity<UserProps>(sym, {
    ...props,
  });

const changeUserName =
  (name: string) =>
  (user: User): User =>
    reconstructUser({
      ...user,
      name,
    });

export { UserId, UserProps, createUser, reconstructUser, changeUserName };
