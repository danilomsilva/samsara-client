import {
  redirect,
  type LoaderArgs,
  json,
  type ActionArgs,
} from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import { validationError } from 'remix-validated-form';
import { z } from 'zod';
import Button from '~/components/Button';
import ErrorMessage from '~/components/ErrorMessage';
import Input from '~/components/Input';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import Select from '~/components/Select';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import { type Obra, getObras } from '~/models/obras.server';
import {
  type Usuario,
  createUsuario,
  getUsuario,
  getUsuarios,
} from '~/models/usuarios.server';
import { getUserSession } from '~/session.server';
import { type Option, TIPOS_ACESSO } from '~/utils/consts';
import { generateCodigo } from '~/utils/utils';
import { newUsuarioScheme } from '~/utils/validators';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);

  const obras: Obra[] = await getObras(userToken);
  if (params.id === 'new') {
    const usuarios = await getUsuarios(userToken, 'created');
    const generatedCodigo = generateCodigo('U', usuarios);
    return json({ obras, generatedCodigo });
  } else {
    const usuario = await getUsuario(userToken, params.id as string);
    return json({ obras, usuario });
  }
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const formData = Object.fromEntries(await request.formData());

  console.log(formData);

  // const validationScheme = z.object({
  //   codigo: z.string(),
  //   nome_completo: z.string().min(1, { message: 'Campo obrigatório' }),
  //   email: z
  //     .string()
  //     .email('Digite um email válido')
  //     .min(1, { message: 'Campo obrigatório' }),
  //   password: z.string().min(1, { message: 'Campo obrigatório' }),
  //   tipo_acesso: z.string(),
  //   obra: z.string(),
  // });

  // console.log(validationScheme);

  // const body: Partial<Usuario> = {
  //   ...formData.data,
  //   tipo_acesso: formData.data.tipo_acesso.name,
  //   obra: formData.data.obra.name,
  //   password: formData.data.password,
  //   passwordConfirm: formData.data.password,
  //   emailVisibility: true,
  // };

  // const user = await createUsuario(userToken, body);
  // if (user.data) {
  //   return json({ error: user.data });
  // }
  // return redirect('..');
  return json({});
}

export default function NewUsuario() {
  const { usuario, obras, generatedCodigo } = useLoaderData();
  const actionData = useActionData();

  const emailAlreadyExists =
    actionData?.error?.email?.message ===
    'The email is invalid or already in use.';

  const sortedObras: Option[] = obras?.items
    ?.map((item: Obra) => {
      const { id, nome } = item;
      return {
        name: id,
        displayName: nome,
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  return (
    <Modal
      title="Adicionar Usuário"
      footerActions={
        <Button
          className="bg-blue"
          icon={<PlusCircleIcon />}
          text="Adicionar"
          name="_action"
          value="create"
        />
      }
    >
      <Row>
        <Input
          type="text"
          name="codigo"
          label="Código"
          className="w-[100px]"
          defaultValue={usuario ? usuario?.codigo : generatedCodigo}
          disabled
        />
        <Input
          type="text"
          name="nome_completo"
          label="Nome completo"
          defaultValue={usuario?.nome_completo}
          autoFocus
        />
      </Row>
      <Row>
        <div className="flex flex-col w-full">
          <Input
            type="text"
            name="email"
            label="Email"
            defaultValue={usuario?.email}
            className="w-60"
          />
          {emailAlreadyExists && (
            <div className="mt-1">
              <ErrorMessage error="Email já utilizado" />
            </div>
          )}
        </div>
        <Input
          type="password"
          name="password"
          label="Senha"
          defaultValue={usuario?.email}
          disabled={usuario}
          className="w-40"
        />
      </Row>
      <Row>
        <Select
          name="obra"
          options={sortedObras}
          label="Alocado à obra"
          defaultValue={usuario?.expand?.obra?.nome}
          className="w-60"
        />
        <Select
          name="tipo_acesso"
          options={TIPOS_ACESSO}
          label="Tipo de acesso"
          defaultValue={usuario?.tipo_acesso}
        />
      </Row>
    </Modal>
  );
}
