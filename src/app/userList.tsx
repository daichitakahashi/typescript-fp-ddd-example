import { type Hono } from 'hono';
import { type User } from '../domain/user';

export const listUser = (users: User[]) => (app: Hono) =>
  app.get('/', (c) =>
    c.html(
      <>
        <h1>Users</h1>
        <ul>
          {users.map((user) => (
            <li>
              <a href={`/user/${user.id}`}>{user.name}</a>
            </li>
          ))}
        </ul>
      </>,
    ),
  );
