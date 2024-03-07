import {
  type ActionArgs,
  json,
  type LoaderArgs,
  type V2_MetaFunction,
  redirect,
} from '@remix-run/node';
import {
  commitSession,
  createUserSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import Input from '~/components/Input';
import Button from '~/components/Button';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import ArrowRightIcon from '~/components/icons/ArrowRightIcon';
import ErrorMessage from '~/components/ErrorMessage';
import { z } from 'zod';
import {
  requestPasswordRequest,
  verifyCredentials,
} from '~/models/auth.server';
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
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z.object({
    email: z
      .string()
      .min(1, { message: 'Campo obrigatório' })
      .email('Digite um email válido'),
  });

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();
    return {
      errors: {
        email: errors.email?._errors[0],
      },
    };
  }

  const requestStatus = await requestPasswordRequest(formData.email as string);
  if (requestStatus === 200 || requestStatus === 204) {
    setToastMessage(
      session,
      'Sucesso',
      `Um email com instruções para troca de senha foi enviado para ${formData.email}`,
      'success'
    );
    return redirect('/login', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  if (requestStatus === 400) {
    setToastMessage(
      session,
      'Aviso!',
      'Um email para troca de senha já foi enviado. Tente novamente em alguns minutos.',
      'info'
    );
    return redirect('/login', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  if (requestStatus === 500) {
    setToastMessage(
      session,
      'Erro',
      'Ocorreu um erro an enviar o email. Tente novamente em alguns minutos ou contate seu administrador.',
      'error'
    );
    return redirect('/login', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function ForgotPassword() {
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
          {actionData?.invalidLoginError && (
            <ErrorMessage error={actionData?.invalidLoginError} />
          )}
          <div className="mt-4 flex flex-col gap-4 items-center w-full">
            <Button
              name="submit"
              value="submit"
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
            <Link to="/login" className="text-sm text-grey cursor-default">
              Fazer login
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
