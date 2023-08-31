import {
  redirect,
  type LoaderArgs,
  json,
  type ActionArgs,
} from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react';
import { validationError } from 'remix-validated-form';
import Button from '~/components/Button';
import ErrorMessage from '~/components/ErrorMessage';
import Input from '~/components/Input';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import Select from '~/components/Select';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import { type Obra, getObras } from '~/models/obras.server';
import { type Usuario, createUsuario } from '~/models/usuarios.server';
import { getUserSession } from '~/session.server';
import { type Option, TIPOS_ACESSO } from '~/utils/consts';
import { newUsuarioScheme } from '~/utils/validators';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  console.log('=================', params.id);
  if (userToken) {
    const obras: Obra[] = await getObras(userToken);
    return json({ obras });
  }
  return json({});
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  //server-side validation
  const formData = await newUsuarioScheme.validate(await request.formData());
  if (formData.error) return validationError(formData.error);

  const body: Partial<Usuario> = {
    ...formData.data,
    tipo_acesso: formData.data.tipo_acesso.name,
    obra: formData.data.obra.name,
    password: formData.data.password,
    passwordConfirm: formData.data.password,
    emailVisibility: true,
  };

  const user = await createUsuario(userToken, body);
  if (user.data) {
    return json({ error: user.data });
  }
  return redirect('..');
}

export default function NewUsuario() {
  const { obras } = useLoaderData();
  const actionData = useActionData();
  const [searchParams] = useSearchParams();
  const userCodigo = searchParams.get('user');

  const emailAlreadyExists =
    actionData?.error?.email?.message ===
    'The email is invalid or already in use.';

  const sortedObras: Option[] = obras.items
    .map((item: Obra) => {
      const { id, nome } = item;
      return {
        name: id,
        displayName: nome,
      };
    })
    .sort((a: Option, b: Option) => a.displayName.localeCompare(b.displayName));

  return (
    <Modal
      title="Adicionar Usuário"
      validator={newUsuarioScheme}
      footerActions={
        <Button
          className="bg-blue"
          icon={<PlusCircleIcon />}
          text="Adicionar"
        />
      }
    >
      <Row>
        <Input
          type="text"
          name="codigo"
          label="Código"
          className="w-[100px]"
          defaultValue={userCodigo ? userCodigo : 'N/A'}
          disabled
        />
        <Input
          type="text"
          name="nome_completo"
          label="Nome completo"
          autoFocus
        />
      </Row>
      <Row>
        <div className="flex flex-col w-full">
          <Input type="text" name="email" label="Email" className="w-60" />
          {emailAlreadyExists && (
            <div className="mt-1">
              <ErrorMessage error="Email já utilizado" />
            </div>
          )}
        </div>
        <Input type="password" name="password" label="Senha" className="w-40" />
      </Row>
      <Row>
        <Select
          name="obra"
          options={sortedObras}
          label="Alocado à obra"
          className="w-60"
        />
        <Select
          name="tipo_acesso"
          options={TIPOS_ACESSO}
          label="Tipo de acesso"
        />
      </Row>
    </Modal>
  );
}
