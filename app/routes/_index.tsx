import {
  json,
  redirect,
  type LoaderArgs,
  type V2_MetaFunction,
  type ActionArgs,
} from '@remix-run/node';
import { Form } from '@remix-run/react';
import { verifyCredentials } from '~/models/auth.server';
import { createUserSession, getUserSession } from '~/session.server';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Samsara' },
    { name: 'Samsara Construtora', content: 'Samsara Construtora' },
  ];
};

// when page is reloaded, will redirect user to dashboard if token stored in cookies
export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  if (userToken) {
    return redirect('/dashboard');
  } else {
    return json({});
  }
}

// when submitting login form, will verify credentials and store or return errors
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  const user = await verifyCredentials(username as string, password as string);

  if (user.jwt) {
    return createUserSession(request, user, '/dashboard');
  } else {
    return json({});
  }
}

export default function Index() {
  return (
    <>
      <div className="">Hello World!!</div>
      <Form method="post" className="flex flex-col w-24">
        <input type="text" name="username" className="border" />
        <input type="text" name="password" className="border" />
        <button type="submit" name="submit">
          Login
        </button>
      </Form>
    </>
  );
}
