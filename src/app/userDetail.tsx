import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { type Hono } from 'hono';
import { type UserId } from '../domain/user';
import { type UserStore } from '../infra/inmemory/user';

export const showUser = (store: UserStore) => (app: Hono) =>
  app.get('/user/:userId', async (c) => {
    const userId = c.req.param('userId');
    const text = await f.pipe(
      userId as UserId, // workaround
      store.getUser,
      TE.match(
        (err) => `error: ${err.type}`,
        (user) => (
          <div>
            <h1>{user.name}</h1>
            <dl>
              <dt>User ID</dt>
              <dd>{user.id}</dd>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </dl>
          </div>
        ),
      ),
    )();
    return c.html(text);
  });
