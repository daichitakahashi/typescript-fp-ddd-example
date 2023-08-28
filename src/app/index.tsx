import * as Ap from 'fp-ts/Apply';
import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { type Hono } from 'hono';
import { UserStore } from '../infra/inmemory/user-command';
import { UserQuery } from '../infra/inmemory/user-query';
import * as command from '../user/command';
import { userDetail } from './userDetail';
import { userList } from './userList';

export const registerRoutes = async (app: Hono) => {
  const query = new UserQuery();
  const store = new UserStore(query.capture);
  const addUser = command.addUser(store.saveUser);

  await f.pipe(
    Ap.sequenceT(TE.ApplySeq)(
      addUser({ name: 'user01', email: 'user01@example.com' }),
      addUser({ name: 'user02', email: 'user02@example.com' }),
      addUser({ name: 'user03', email: 'user03@example.com' }),
    ),
    TE.match(
      (err) => {
        throw err;
      },
      // routes
      () => f.pipe(app, userList(query), userDetail(store)),
    ),
  )();
};
