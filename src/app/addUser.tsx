import { vValidator } from '@hono/valibot-validator';
import * as TE from 'fp-ts/TaskEither';
import * as f from 'fp-ts/function';
import { type Hono } from 'hono';
import { object, string, email, minLength, maxLength } from 'valibot';
import { type addUser as addUserFunc } from '@/user/command';

const formWithError = (errorMessage?: string) => (
  <form action="/users" method="post">
    {errorMessage ? <b>{errorMessage}</b> : null}
    <div>
      <label htmlFor="userName">User name</label>
      <input type="text" name="userName" id="userName" />
    </div>
    <div>
      <label htmlFor="userEmail">Email of user</label>
      <input type="email" name="userEmail" id="userEmail" />
    </div>
    <button type="submit">Add</button>
  </form>
);

export const addUserForm = (app: Hono) =>
  app.get('/users', (c) => c.html(formWithError()));

export const addUser = (add: ReturnType<typeof addUserFunc>) => (app: Hono) =>
  app.post(
    '/users',
    vValidator(
      // TODO: Validation error message
      'form',
      object({
        userName: string([minLength(5), maxLength(20)]),
        userEmail: string([email()]),
      }),
    ),
    async (c) => {
      await c.req.formData();
      const form = c.req.valid('form');
      return await f.pipe(
        add({
          name: form.userName,
          email: form.userEmail,
        }),
        TE.match(
          (err) => c.html(formWithError(err.type)),
          (createdUser) => c.redirect(`/users/${createdUser.id}`),
        ),
      )();
    },
  );
