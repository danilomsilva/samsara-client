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
import Input from '~/components/Input';
import Button from '~/components/Button';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import ArrowRightIcon from '~/components/icons/ArrowRightIcon';
import ErrorMessage from '~/components/ErrorMessage';
import { z } from 'zod';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { confirmPasswordRequest } from '~/models/auth.server';

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
  const queryParams = new URL(request.url).searchParams;
  const token = queryParams.get('token');
  const formData = Object.fromEntries(await request.formData());
  console.log(token, formData);
  const validationScheme = z.object({
    password: z.string().min(1, { message: 'Campo obrigatório' }),
    passwordConfirm: z.string().min(1, { message: 'Campo obrigatório' }),
  });

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();
    console.log('getting here...', errors);
    return {
      errors: {
        password: errors.password?._errors[0],
        passwordConfirm: errors.passwordConfirm?._errors[0],
      },
    };
  }

  const confirmStatus = await confirmPasswordRequest(
    token as string,
    formData.password as string,
    formData.passwordConfirm as string
  );
  if (confirmStatus === 200 || confirmStatus === 204) {
    setToastMessage(
      session,
      'Sucesso',
      `Senha atualizada com sucesso!`,
      'success'
    );
    return redirect('/login', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  if (confirmStatus === 400) {
    setToastMessage(
      session,
      'Aviso!',
      'Senha informada não são identicas e/ou muito curtas/fracas',
      'info'
    );
    return redirect('.', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  if (confirmStatus === 500) {
    setToastMessage(
      session,
      'Erro',
      'Ocorreu um erro ao trocar sua senha. Tente novamente ou contate o administrador.',
      'error'
    );
    return redirect('.', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function ConfirmPasswordReset() {
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
            type="password"
            name="password"
            label="Nova senha"
            error={actionData?.errors?.password}
          />
          <Input
            type="password"
            name="passwordConfirm"
            label="Repita a nova senha"
            error={actionData?.errors?.password}
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
            <Link to="/login" className="text-sm text-grey">
              Fazer login
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
