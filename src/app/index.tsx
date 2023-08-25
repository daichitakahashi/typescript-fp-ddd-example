import * as Ap from 'fp-ts/Apply';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { type Hono } from 'hono';
import { UserStore } from '../infra/inmemory/user';
import * as command from '../user/command';
import { userDetail } from './userDetail';
import { listUser } from './userList';

export const registerRoutes = async (app: Hono) => {
  const store = new UserStore(() => T.of(f.constVoid()));
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
      (users) => f.pipe(app, listUser(users), userDetail(store)),
    ),
  )();
};
