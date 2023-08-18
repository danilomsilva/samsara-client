import {
  type ActionArgs,
  json,
  type LoaderArgs,
  type V2_MetaFunction,
  redirect,
} from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { verifyCredentials } from '~/models/auth.server';
import { createUserSession, getUserSession } from '~/session.server';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Samsara' },
    { name: 'Samsara Construtora', content: 'Samsara Construtora' },
  ];
};

// will redirect back to dasboard if user is logged in!
export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);

  if (userToken) return redirect('/dashboard');
  return json({});
}

// when submitting login form, will verify credentials and store or return errors
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  if (!username) {
    return json({
      errors: { username: 'Username obrigatorio', password: null },
    });
  }

  if (!password) {
    return json({
      errors: { username: null, password: 'Password obrigatorio' },
    });
  }

  const user = await verifyCredentials(username as string, password as string);

  if (user.token) {
    return createUserSession(request, user, '/dashboard');
  } else {
    return json({
      errors: {
        username: null,
        password: null,
        invalidLogin: 'Username ou senha invalidos!',
      },
    });
  }
}

export default function Index() {
  const actionData = useActionData();
  const errors = actionData?.errors;

  return (
    <>
      <div className="">Hello World!!</div>

      <Form method="post" className="flex flex-col w-24">
        <input type="text" name="username" className="border" />
        {errors?.username && (
          <div className="text-xs text-red-500">{errors?.username}</div>
        )}

        <input type="text" name="password" className="border" />
        {errors?.password && (
          <div className="text-xs text-red-500">{errors?.password}</div>
        )}

        <button type="submit" name="submit">
          Login
        </button>
        {errors?.invalidLogin && (
          <div className="text-xs text-red-500">{errors?.invalidLogin}</div>
        )}
      </Form>
    </>
  );
}
