import {
  type ActionArgs,
  type LoaderArgs,
  redirect,
  json,
} from '@remix-run/node';
import { Form } from '@remix-run/react';
import { getUserSession, logout } from '~/session.server';

// if user token do not exists in cookies, will redirect to login
export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  if (!userToken) return redirect('/login');
  return json({});
}

// will destroy cookie session and logout user
export async function action({ request }: ActionArgs) {
  return await logout(request);
}

export default function Dashboard() {
  return (
    <Form method="post">
      <button type="submit">Logout</button>
    </Form>
  );
}
