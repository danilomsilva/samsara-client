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
    <>
      <ValidatedForm validator={validator} method="post">
        <Input name="username" label="username" />
        <Input name="password" label="Senha" />
        <Button />
      </ValidatedForm>
      {actionData && (
        <div className="text-red">{actionData.invalidLoginError}</div>
      )}
    </>
  );
}
