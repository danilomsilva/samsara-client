import { type ActionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { logout } from '~/session.server';

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
