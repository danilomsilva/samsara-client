import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from '@remix-run/node';
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { z } from 'zod';
import Button from '~/components/Button';
import ErrorMessage from '~/components/ErrorMessage';
import Input from '~/components/Input';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import Select from '~/components/Select';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { type Obra, getObras } from '~/models/obras.server';
import {
  type Usuario,
  getUsuario,
  getUsuarios,
  updateUsuario,
  createUsuarioANDUpdate,
} from '~/models/usuarios.server';
import { getUserSession } from '~/session.server';
import { type Option, TIPOS_ACESSO } from '~/utils/consts';
import { capitalizeWords, generateCodigo } from '~/utils/utils';

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

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z.object({
    codigo: z.string(),
    nome_completo: z.string().min(1, { message: 'Campo obrigatório' }),
    email: z
      .string()
      .min(1, { message: 'Campo obrigatório' })
      .email('Digite um email válido'),
    password: z
      .string()
      .min(1, { message: 'Campo obrigatório' })
      .min(5, { message: 'Senha muito curta' }),
    tipo_acesso: z
      .string()
      .refine((val) => val, { message: 'Campo obrigatório' }),
    obra: z.string().refine((val) => val, { message: 'Campo obrigatório' }),
  });

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();
    return {
      errors: {
        codigo: errors.codigo?._errors[0],
        nome_completo: errors.nome_completo?._errors[0],
        email: errors.email?._errors[0],
        password: errors.password?._errors[0],
        tipo_acesso: errors.tipo_acesso?._errors[0],
        obra: errors.obra?._errors[0],
      },
    };
  }

  const body: Partial<Usuario> = {
    ...formData,
    nome_completo: capitalizeWords(formData.nome_completo as string),
    password: formData.password,
    passwordConfirm: formData.password,
    emailVisibility: true,
  };

  if (formData._action === 'create') {
    const user = await createUsuarioANDUpdate(userToken, body);
    if (user.data) {
      return json({ error: user.data });
    }
  }

  if (formData._action === 'edit') {
    // to reset password, must include password, passwordConfirm and oldPassword
    const editBody = {
      nome_completo: formData?.nome_completo,
      tipo_acesso: formData?.tipo_acesso,
      obra: formData?.obra,
    };
    await updateUsuario(userToken, params.id as string, editBody as Usuario);
  }
  return redirect('..');
}

export default function NewUsuario() {
  const { usuario, obras, generatedCodigo } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

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
      title={`${usuario ? 'Editar' : 'Adicionar'} Usuário`}
      variant={usuario ? 'grey' : 'blue'}
      content={
        <>
          <Row>
            <Input
              type="text"
              name="codigo"
              label="Código"
              className="w-[100px]"
              defaultValue={usuario ? usuario?.codigo : generatedCodigo}
              error={actionData?.errors?.codigo}
              disabled
            />
            <Input
              type="text"
              name="nome_completo"
              label="Nome completo"
              defaultValue={usuario?.nome_completo}
              error={actionData?.errors?.nome_completo}
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
                error={actionData?.errors?.email}
                disabled={usuario}
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
              error={actionData?.errors?.password}
              disabled={usuario}
              className="w-40"
            />
          </Row>
          <Row>
            <Select
              name="obra"
              options={sortedObras}
              label="Alocado à obra"
              defaultValue={usuario?.obra}
              placeholder="-"
              error={actionData?.errors?.obra}
              className="w-60"
            />
            <Select
              name="tipo_acesso"
              options={TIPOS_ACESSO}
              label="Tipo de acesso"
              defaultValue={usuario?.tipo_acesso}
              placeholder="-"
              error={actionData?.errors?.tipo_acesso}
            />
          </Row>
        </>
      }
      footerActions={
        <Button
          variant={usuario ? 'grey' : 'blue'}
          icon={
            isSubmitting ? (
              <SpinnerIcon />
            ) : usuario ? (
              <PencilIcon />
            ) : (
              <PlusCircleIcon />
            )
          }
          text={usuario ? 'Editar' : 'Adicionar'}
          name="_action"
          value={usuario ? 'edit' : 'create'}
        />
      }
    ></Modal>
  );
}
