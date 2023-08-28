import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { type Hono } from 'hono';
import { type UserQuery } from '@/infra/inmemory/user-query';

export const userList = (query: UserQuery) => (app: Hono) =>
  app.get(
    '/',
    async (c) =>
      await f.pipe(
        query.list(),
        TE.match(
          () => c.html(<h1>unknown error</h1>),
          (users) =>
            c.html(
              <>
                <h1>Users</h1>
                <ul>
                  {users.map((user) => (
                    <li>
                      <a href={`/users/${user.id}`}>{user.name}</a>
                    </li>
                  ))}
                </ul>
              </>,
            ),
        ),
      )(),
  );
