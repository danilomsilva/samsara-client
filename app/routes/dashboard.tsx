import {
  type ActionArgs,
  type LoaderArgs,
  redirect,
  json,
  type V2_MetaFunction,
} from '@remix-run/node';
import { Form, Link } from '@remix-run/react';
import { getUserSession, logout } from '~/session.server';
import { isMobile } from 'react-device-detect';
import Button from '~/components/Button';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Dashboard | Samsara' }];
};

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
  if (isMobile) {
    return (
      <div className="h-full flex flex-col items-center gap-32">
        <div className="pt-10 flex flex-col gap-6">
          <img src="/assets/logo.png" alt="logo" width={80} height={80} />
          <h1 className="text-2xl text-blue font-semibold">Dashboard</h1>
        </div>
        <Link
          to="/boletim/new"
          className="bg-orange rounded-md text-white h-12 w-full flex justify-center items-center"
        >
          Boletim
        </Link>
      </div>
    );
  } else {
    return (
      <Form method="post">
        <button type="submit">DESKTOP</button>
      </Form>
    );
  }
}
