import {
  type ActionArgs,
  json,
  type LoaderArgs,
  type V2_MetaFunction,
  redirect,
} from '@remix-run/node';
import { createUserSession, getUserSession } from '~/session.server';
import { ValidatedForm } from 'remix-validated-form';
import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
import Input from '~/components/Input';
import Button from '~/components/Button';
import { verifyCredentials } from '~/models/auth.server';
import { useActionData } from '@remix-run/react';
import ArrowRight from '~/icons/ArrowRight';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Login | Samsara' }];
};

// form validation scheme
export const validator = withZod(
  z.object({
    username: z.string().min(1, { message: 'Campo obrigatório' }),
    password: z.string().min(1, { message: 'Campo obrigatório' }),
  })
);

// will redirect user to dashboard if token exists in cookies
export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  if (userToken) return redirect('/dashboard');
  return json({});
}

// will verify credentials and if valid, create user session and redirect to dashboard
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  const user = await verifyCredentials(username as string, password as string);

  if (user.token) return createUserSession(request, user, '/dashboard');
  return json({
    invalidLoginError: 'Usuário ou senha inválido',
  });
}

export default function MyPage() {
  const actionData = useActionData();

  return (
    <div className="w-full h-screen flex items-center justify-center flex-col">
      <div className="bg-grey-light p-10 pt-16 rounded-lg flex flex-col items-center gap-6">
        <img src="/assets/logo.png" alt="logo" width={60} height={60} />
        <ValidatedForm
          validator={validator}
          method="post"
          className="flex flex-col gap-2"
        >
          <Input name="username" label="Usuário" className="w-72" />
          <Input name="password" label="Senha" className="w-72" />
          {actionData && (
            <div className="text-red ml-1">{actionData.invalidLoginError}</div>
          )}
          <div className="mt-4 flex flex-col gap-4 items-center w-full">
            <Button text="Avançar" icon={<ArrowRight />} className="w-32" />
            <div className="text-sm text-grey">Esqueci minha senha</div>
          </div>
        </ValidatedForm>
      </div>
    </div>
  );
}
