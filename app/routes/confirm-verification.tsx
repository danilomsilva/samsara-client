import {
  type ActionArgs,
  json,
  type LoaderArgs,
  type V2_MetaFunction,
  redirect,
} from '@remix-run/node';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import Button from '~/components/Button';
import { Form, useNavigation } from '@remix-run/react';
import ArrowRightIcon from '~/components/icons/ArrowRightIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { confirmVerification } from '~/models/auth.server';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Confirmação de email | Samsara' }];
};

// will redirect user to dashboard if token exists in cookies
export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  if (userToken) return redirect('/dashboard');
  return json({});
}

// will verify credentials and if valid, create user session and redirect to dashboard
export async function action({ request }: ActionArgs) {
  const queryParams = new URL(request.url).searchParams;
  const session = await getSession(request);
  const token = queryParams.get('token');

  await confirmVerification(token as string);
  setToastMessage(
    session,
    'Sucesso',
    'Email verificado com sucesso',
    'success'
  );
  return redirect(`/login`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export default function ForgotPassword() {
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  return (
    <div className="w-full h-screen flex items-center justify-center flex-col">
      <div className="bg-grey-light p-10 pt-16 rounded-lg flex flex-col items-center gap-6">
        <img src="/assets/logo.png" alt="logo" width={60} height={60} />
        <p>Bem-vindo ao Boletim Samsara</p>
        <p>
          Clique no botão abaixo para confirmar seu email e faça login para
          começar a usar o sistema.
        </p>
        <Form method="post" className="flex flex-col gap-2 w-[250px]">
          <div className="mt-4 flex flex-col gap-4 items-center w-full">
            <Button
              name="submit"
              value="submit"
              text="Confirmar email"
              icon={
                isSubmitting ? (
                  <SpinnerIcon />
                ) : (
                  <ArrowRightIcon className="h-4 w-4" />
                )
              }
              variant="blue"
            />
          </div>
        </Form>
      </div>
    </div>
  );
}
