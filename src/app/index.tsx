import * as Ap from 'fp-ts/Apply';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { type Hono } from 'hono';
import { createUser } from '../domain/workflow/user';
import { UserStore } from '../infra/inmemory/user';
import { showUser } from './userDetail';
import { listUser } from './userList';

const addUser =
  (props: { name: string; email: string }) => (store: UserStore) =>
    f.pipe(
      props,
      createUser,
      TE.fromEither,
      TE.flatMap((e) =>
        f.pipe(e.artifact, (user) =>
          f.pipe(
            user.id,
            store.saveUser([e.event]),
            TE.map(() => user),
          ),
        ),
      ),
    );

export const registerRoutes = async (app: Hono) => {
  const store = new UserStore();
  await f.pipe(
    store,
    Ap.sequenceT(RTE.ApplySeq)(
      addUser({ name: 'user01', email: 'user01@example.com' }),
      addUser({ name: 'user02', email: 'user02@example.com' }),
      addUser({ name: 'user03', email: 'user03@example.com' }),
    ),
    TE.match(
      (err) => {
        throw err;
      },
      // routes
      (users) => f.pipe(app, listUser(users), showUser(store)),
    ),
  )();
};
