import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import { z } from 'zod';
import Button from '~/components/Button';
import Input from '~/components/Input';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import Select from '~/components/Select';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { getObras } from '~/models/obra.server';
import {
  type Operador,
  getOperador,
  getOperadores,
  _createOperador,
  _updateOperador,
} from '~/models/operador.server';
import { getUsuarios } from '~/models/usuario.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import {
  type Option,
  OPERADOR_ATIVIDADES,
  CAMPO_OBRIGATORIO,
} from '~/utils/consts';
import { capitalizeWords, genCodigo } from '~/utils/utils';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);

  const obras = await getObras(userToken, 'created', '');
  const usuarios = await getUsuarios(userToken, 'created', '');
  const encarregados = usuarios?.items
    ?.filter(
      (usuario) => usuario.tipo_acesso === 'Encarregado' && !usuario?.inativo
    )
    .map((usuario) => ({
      name: usuario?.id,
      displayName: usuario?.nome_completo,
    }));

  if (params.id === 'new') {
    const operadores = await getOperadores(userToken, 'created', '');
    const newCode = genCodigo(operadores, 'OP-');
    return json({ obras, encarregados, newCode });
  } else {
    const operador = await getOperador(userToken, params.id as string);
    return json({ obras, encarregados, operador });
  }
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z.object({
    codigo: z.string(),
    nome_completo: z.string().min(1, CAMPO_OBRIGATORIO),
    atividade: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    obra: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    encarregado: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
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
        encarregado: errors.nome_completo?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const body: Partial<Operador> = {
      ...formData,
      nome_completo: capitalizeWords(formData.nome_completo as string),
    };
    const operador = await _createOperador(userToken, body);
    if (operador.data) {
      return json({ error: operador.data });
    }
    setToastMessage(session, 'Sucesso', 'Operador adicionado!', 'success');
    return redirect('/operador', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    const editBody = {
      nome_completo: capitalizeWords(formData.nome_completo as string),
      atividade: formData?.atividade,
      obra: formData?.obra,
      encarregado: formData?.encarregado,
    };
    await _updateOperador(
      userToken,
      params.id as string,
      editBody as Partial<Operador>
    );
    setToastMessage(session, 'Sucesso', 'Operador editado!', 'success');
    return redirect('/operador', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return redirect('..');
}

export default function NewOperador() {
  const { operador, obras, newCode, encarregados } =
    useLoaderData<typeof loader>();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';
  const [searchParams] = useSearchParams();
  const isReadMode = searchParams.get('read');

  const sortedObras: Option[] = obras?.items
    ?.filter((item) => !item?.inativo)
    ?.map((item) => {
      const { id, nome } = item;
      return {
        name: id || '',
        displayName: nome || '',
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  return (
    <Modal
      title={`${isReadMode ? '' : operador ? 'Editar' : 'Adicionar'} Operador`}
      variant={isReadMode ? 'green' : operador ? 'grey' : 'blue'}
      content={
        <>
          <Row>
            <Input
              type="text"
              name="codigo"
              label="Código"
              className="!w-[100px]"
              defaultValue={operador ? operador?.codigo : `OP-${newCode}`}
              error={actionData?.errors?.codigo}
              disabled
            />
            <Input
              type="text"
              name="nome_completo"
              label="Nome completo"
              defaultValue={operador?.nome_completo}
              error={actionData?.errors?.nome_completo}
              autoFocus={!isReadMode}
              disabled={!!isReadMode}
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
              disabled={!!isReadMode}
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
              disabled={!!isReadMode}
            />
            <Select
              name="encarregado"
              options={encarregados}
              label="Encarregado"
              defaultValue={operador?.encarregado}
              placeholder="-"
              error={actionData?.errors?.encarregado}
              disabled={!!isReadMode}
            />
          </Row>
        </>
      }
      footerActions={
        isReadMode ? null : (
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
        )
      }
    ></Modal>
  );
}
