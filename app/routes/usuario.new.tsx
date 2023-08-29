import {
  redirect,
  type LoaderArgs,
  json,
  type ActionArgs,
} from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { z } from 'zod';
import Button from '~/components/Button';
import Input from '~/components/Input';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import Select from '~/components/Select';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import { type Obra, getObras } from '~/models/obras.server';
import { type Usuario, createUsuario } from '~/models/usuarios.server';
import { getUserSession } from '~/session.server';
import { type Option, TIPOS_ACESSO } from '~/utils/consts';

// form validation scheme
export const validator = withZod(
  z.object({
    codigo: z.string(),
    nome_completo: z.string().min(1, { message: 'Campo obrigatório' }),
    email: z.string().min(1, { message: 'Campo obrigatório' }),
    password: z.string().min(1, { message: 'Campo obrigatório' }),
    tipo_acesso: z
      .string()
      .refine((val) => val !== '-', { message: 'Campo obrigatório' }),
    obra: z
      .string()
      .refine((val) => val !== '-', { message: 'Campo obrigatório' }),
  })
);

export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  if (userToken) {
    const obras: Obra[] = await getObras(userToken);
    return json({ obras });
  }
  return json({});
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  //server-side validation
  const data = await validator.validate(await request.formData());
  if (data.error) return validationError(data.error);

  const body: Partial<Usuario> = {
    ...data.data,
    password: data.data.password,
    passwordConfirm: data.data.password,
    emailVisibility: true,
  };

  if (userToken) {
    await createUsuario(userToken, body);
    return redirect('..');
  }
  return json({});
}

export default function NewUsuario() {
  const { obras } = useLoaderData();
  const [searchParams] = useSearchParams();
  const userCodigo = searchParams.get('user');

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
      validator={validator}
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
          className="w-40"
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
        <Input type="text" name="email" label="Email" />
        <Input type="password" name="password" label="Senha" className="w-40" />
      </Row>
      <Row>
        <Select
          name="tipo_acesso"
          options={TIPOS_ACESSO}
          label="Tipo de acesso"
        />
        <Select name="obra" options={sortedObras} label="Alocado à obra" />
      </Row>
    </Modal>
  );
}
