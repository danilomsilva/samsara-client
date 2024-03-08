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
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import ArrowRightIcon from '~/components/icons/ArrowRightIcon';
import ErrorMessage from '~/components/ErrorMessage';
import { z } from 'zod';
import { verifyCredentials } from '~/models/auth.server';
import SpinnerIcon from '~/components/icons/SpinnerIcon';

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
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z.object({
    email: z
      .string()
      .min(1, { message: 'Campo obrigatório' })
      .email('Digite um email válido'),
    password: z.string().min(1, { message: 'Campo obrigatório' }),
  });

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();
    return {
      errors: {
        email: errors.email?._errors[0],
        password: errors.password?._errors[0],
      },
    };
  }

  const user = await verifyCredentials(
    formData.email as string,
    formData.password as string
  );

  if (user.token) {
    if (user?.record?.verified) {
      return createUserSession(request, user, '/dashboard');
    } else {
      return {
        invalidLoginError: 'Pendente confirmação de email',
      };
    }
  } else {
    return {
      invalidLoginError: 'Usuário ou senha inválido',
    };
  }
}

export default function Login() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  return (
    <div className="w-full h-screen flex items-center justify-center flex-col">
      <div className="bg-grey-light p-10 pt-16 rounded-lg flex flex-col items-center gap-6">
        <img src="/assets/logo.png" alt="logo" width={60} height={60} />
        <Form method="post" className="flex flex-col gap-2 w-[250px]">
          <Input
            type="text"
            name="email"
            label="Email"
            error={actionData?.errors?.email}
          />
          <Input
            type="password"
            name="password"
            label="Senha"
            error={actionData?.errors?.password}
          />
          {actionData?.invalidLoginError && (
            <ErrorMessage error={actionData?.invalidLoginError} />
          )}
          <div className="mt-4 flex flex-col gap-4 items-center w-full">
            <Button
              name="avancar"
              value="create"
              text="Avançar"
              icon={
                isSubmitting ? (
                  <SpinnerIcon />
                ) : (
                  <ArrowRightIcon className="h-4 w-4" />
                )
              }
              variant="blue"
            />
            <Link to="/forgot-password" className="text-sm text-grey">
              Esqueci minha senha
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
