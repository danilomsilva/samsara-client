import {
  type ActionArgs,
  json,
  type LoaderArgs,
  type V2_MetaFunction,
  redirect,
} from "@remix-run/node";
import { createUserSession, getUserSession } from "~/session.server";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import Input from "~/components/Input";
import Button from "~/components/Button";
import { verifyCredentials } from "~/models/auth.server";
import { useActionData } from "@remix-run/react";

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: "Login | Samsara" }];
};

// form validation scheme
export const validator = withZod(
  z.object({
    username: z.string().min(1, { message: "Username obrigatorio" }),
    password: z.string().min(1, { message: "Senha obrigatoria" }),
  })
);

// will redirect user to dashboard if token exists in cookies
export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  if (userToken) return redirect("/dashboard");
  return json({});
}

// will verify credentials and if valid, create user session and redirect to dashboard
export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  const user = await verifyCredentials(username as string, password as string);

  if (user.token) return createUserSession(request, user, "/dashboard");
  return json({
    invalidLoginError: "Email ou senha invalidos. Tente novamente",
  });
}

export default function MyPage() {
  const actionData = useActionData();

  return (
    <div className="w-full h-screen flex items-center justify-center flex-col">
      <div className="bg-grey-light p-10 rounded-lg flex flex-col items-center gap-6">
        <img src="/assets/logo.png" alt="logo" width={50} height={50} />
        <ValidatedForm
          validator={validator}
          method="post"
          className="flex flex-col gap-4"
        >
          <Input name="username" label="Username" />
          <Input name="password" label="Senha" />
          <Button text="Avancar" />
        </ValidatedForm>
        {actionData && (
          <div className="text-red">{actionData.invalidLoginError}</div>
        )}
      </div>
    </div>
  );
}
