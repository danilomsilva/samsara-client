import { type ActionArgs, json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { getOperadores } from '~/models/operadores.server';
import { logout } from '~/session.server';

export async function loader() {
  const data = await getOperadores();
  return json({ data });
}

export async function action({ request }: ActionArgs) {
  return await logout(request);
}

export default function Dashboard() {
  const { data } = useLoaderData();
  console.log('DATA >>>', data);
  return (
    <Form method="post">
      <button type="submit">Logout</button>
    </Form>
  );
}
