import {
  type ActionArgs,
  json,
  type LoaderArgs,
  type V2_MetaFunction,
  redirect,
} from '@remix-run/node';
import { createUserSession, getUserSession } from '~/session.server';
import Input from '~/components/Input';
import Button from '~/components/Button';
import { verifyCredentials } from '~/models/auth.server';
import { Form, useActionData } from '@remix-run/react';
import ArrowRightIcon from '~/components/icons/ArrowRightIcon';
import Tooltip from '~/components/Tooltip';
import { loginScheme } from '~/utils/validators';
import ErrorMessage from '~/components/ErrorMessage';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Login | Samsara' }];
};

// will redirect user to dashboard if token exists in cookies
export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  if (userToken) return redirect('/dashboard');
  return json({});
}

// will verify credentials and if valid, create user session and redirect to dashboard
export async function action({ request }: ActionArgs) {
  const formData = await loginScheme.validate(await request.formData());
  const user = await verifyCredentials(
    formData.data.email,
    formData.data.password
  );

  if (user.token) {
    return createUserSession(request, user, '/dashboard');
  }
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
        <Form method="post" className="flex flex-col gap-2 w-[250px]">
          <Input type="text" name="email" label="Email" />
          <Input type="password" name="password" label="Senha" />
          {actionData && <ErrorMessage error={actionData.invalidLoginError} />}
          <div className="mt-4 flex flex-col gap-4 items-center w-full">
            <Button
              text="Avançar"
              icon={<ArrowRightIcon className="h-4 w-4" />}
              className="w-32"
            />
            <div className="text-sm text-grey cursor-default">
              <Tooltip
                contentClassName="w-[200px]"
                content={
                  <p>
                    Ligue: <strong>19 99999-9999</strong>
                  </p>
                }
              >
                Esqueci minha senha
              </Tooltip>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
