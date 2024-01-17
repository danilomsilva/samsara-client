import {
  type ActionArgs,
  type LoaderArgs,
  redirect,
  json,
  type V2_MetaFunction,
} from '@remix-run/node';
import { Link } from '@remix-run/react';
import { getUserSession, logout } from '~/session.server';

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
  return (
    <>
      {/* SHOW WHEN SCREEN GETS SMALLER */}
      <div className="flex flex-col items-center gap-2 pt-10 lg:hidden">
        <img src="/assets/logo.png" alt="logo" width={80} height={80} />
        <h1 className="font-semibold text-blue text-2xl">Dashboard</h1>
        <Link
          to="/boletim/new"
          className="w-[300px] bg-orange py-4 px-6 text-white uppercase text-center rounded font-semibold text-sm mt-20"
        >
          Boletim
        </Link>
      </div>
      {/* SHOW WHEN SCREEN GETS BIGGER */}
      <div className="max-lg:hidden">Logout</div>
    </>
  );
}

// tailwind css breakpoints helper notes
// lg:hidden - will make it show when the breakpoint is less or equal to lg
// max-lg:hidden - will make it show when breakpoint is more than lg
