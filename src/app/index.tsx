import * as Ap from 'fp-ts/Apply';
import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { type Hono } from 'hono';
import { addUserForm, addUser } from './addUser';
import { userDetail } from './userDetail';
import { userList } from './userList';
import { UserStore } from '@/infra/inmemory/user-command';
import { UserQuery } from '@/infra/inmemory/user-query';
import * as command from '@/user/command';

export const registerRoutes = async (app: Hono) => {
  const query = new UserQuery();
  const store = new UserStore(query.capture);
  const addUserCommand = command.addUser(store.saveUser);

  await f.pipe(
    Ap.sequenceT(TE.ApplySeq)(
      addUserCommand({ name: 'user01', email: 'user01@example.com' }),
      addUserCommand({ name: 'user02', email: 'user02@example.com' }),
      addUserCommand({ name: 'user03', email: 'user03@example.com' }),
    ),
    TE.match(
      (err) => {
        throw err;
      },
      // routes
      () =>
        f.pipe(
          app,
          userList(query),
          userDetail(store),
          addUserForm,
          addUser(addUserCommand),
        ),
    ),
  )();
};
