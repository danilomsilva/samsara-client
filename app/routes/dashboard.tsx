import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { getOperadores } from '~/models/operadores.server';
import { getUserSession, logout } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);

  if (userToken) {
    const data = await getOperadores(userToken);
    return json({ data });
  } else {
    return redirect('/');
  }
}

export async function action({ request }: ActionArgs) {
  return await logout(request);
}

export default function Dashboard() {
  const { data } = useLoaderData();
  console.log('DATA >>>', data);
  return (
    <>
      <Form method="post">
        <button type="submit">Logout</button>
      </Form>

      <ul>
        {data.items.map((item) => {
          return <li key={item.id}>{item.full_name}</li>;
        })}
      </ul>
    </>
  );
}
