import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from '@remix-run/node';
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { z } from 'zod';
import Button from '~/components/Button';
import Input from '~/components/Input';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import Select from '~/components/Select';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { type Obra, getObras } from '~/models/obras.server';
import {
  type Operador,
  createOperador,
  getOperador,
  getOperadores,
  updateOperador,
} from '~/models/operador.server';
import { type Usuario, getUsuarios } from '~/models/usuarios.server';
import { getUserSession } from '~/session.server';
import { type Option, OPERADOR_ATIVIDADES } from '~/utils/consts';
import { generateCodigo } from '~/utils/utils';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);

  const obras: Obra[] = await getObras(userToken);
  const usuarios: Usuario[] = await getUsuarios(userToken, 'created');
  const encarregados = usuarios
    .filter((usuario) => usuario.tipo_acesso === 'Encarregado')
    .map((usuario) => ({
      name: usuario?.id,
      displayName: usuario?.nome_completo,
    }));

  if (params.id === 'new') {
    const operadores = await getOperadores(userToken, 'created');
    const generatedCodigo = generateCodigo('OP', operadores);
    return json({ obras, encarregados, generatedCodigo });
  } else {
    const operador = await getOperador(userToken, params.id as string);
    return json({ obras, encarregados, operador });
  }
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z.object({
    codigo: z.string(),
    nome_completo: z.string().min(1, { message: 'Campo obrigatório' }),
    atividade: z
      .string()
      .refine((val) => val, { message: 'Campo obrigatório' }),
    obra: z.string().refine((val) => val, { message: 'Campo obrigatório' }),
    encarregado: z
      .string()
      .refine((val) => val, { message: 'Campo obrigatório' }),
  });

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();
    return {
      errors: {
        codigo: errors.codigo?._errors[0],
        nome_completo: errors.nome_completo?._errors[0],
        atividade: errors.atividade?._errors[0],
        obra: errors.obra?._errors[0],
        encaregado: errors.nome_completo?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const operador = await createOperador(userToken, formData);
    if (operador.data) {
      return json({ error: operador.data });
    }
  }

  if (formData._action === 'edit') {
    const editBody = {
      nome_completo: formData?.nome_completo,
      atividade: formData?.atividade,
      obra: formData?.obra,
      encarregado: formData?.encarregado,
    };
    await updateOperador(
      userToken,
      params.id as string,
      editBody as Partial<Operador>
    );
  }
  return redirect('..');
}

export default function NewOperador() {
  const { operador, obras, generatedCodigo, encarregados } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

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
      title={`${operador ? 'Editar' : 'Adicionar'} Operador`}
      variant={operador ? 'grey' : 'blue'}
      content={
        <>
          <Row>
            <Input
              type="text"
              name="codigo"
              label="Código"
              className="!w-[100px]"
              defaultValue={operador ? operador?.codigo : generatedCodigo}
              error={actionData?.errors?.codigo}
              disabled
            />
            <Input
              type="text"
              name="nome_completo"
              label="Nome completo"
              defaultValue={operador?.nome_completo}
              error={actionData?.errors?.nome_completo}
              autoFocus
            />
          </Row>
          <Row>
            <Select
              name="obra"
              options={sortedObras}
              label="Alocado à obra"
              defaultValue={operador?.obra}
              placeholder="-"
              error={actionData?.errors?.obra}
              className="w-60"
            />
          </Row>
          <Row>
            <Select
              name="atividade"
              options={OPERADOR_ATIVIDADES}
              label="Atividade"
              defaultValue={operador?.atividade}
              placeholder="-"
              error={actionData?.errors?.atividade}
            />
            <Select
              name="encarregado"
              options={encarregados}
              label="Encarregado"
              defaultValue={operador?.encarregado}
              placeholder="-"
              error={actionData?.errors?.encarregado}
            />
          </Row>
        </>
      }
      footerActions={
        <Button
          variant={operador ? 'grey' : 'blue'}
          icon={
            isSubmitting ? (
              <SpinnerIcon />
            ) : operador ? (
              <PencilIcon />
            ) : (
              <PlusCircleIcon />
            )
          }
          text={operador ? 'Editar' : 'Adicionar'}
          name="_action"
          value={operador ? 'edit' : 'create'}
        />
      }
    ></Modal>
  );
}
