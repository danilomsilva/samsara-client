import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from '@remix-run/node';
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import { z } from 'zod';
import Button from '~/components/Button';
import Input from '~/components/Input';
import InputTag from '~/components/InputTag';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import Select from '~/components/Select';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { getGruposEquipamento } from '~/models/equipamento.server';
import {
  _createEquipamentoTipo,
  getEquipamentoTipo,
  _updateEquipamentoTipo,
  type EquipamentoTipo,
} from '~/models/equipamento_tipo.server';
import { getOperacoes } from '~/models/operacao.server';

import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { CAMPO_OBRIGATORIO, type Option } from '~/utils/consts';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  const equipamentoGrupos = await getGruposEquipamento(userToken, 'created');
  const operacoes = await getOperacoes(userToken, 'created');

  if (params.id === 'new') {
    return json({ equipamentoGrupos, operacoes });
  } else {
    const equipamentoTipo = await getEquipamentoTipo(
      userToken,
      params.id as string
    );
    return json({ equipamentoTipo, equipamentoGrupos, operacoes });
  }
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z.object({
    tipo_nome: z.string().min(1, CAMPO_OBRIGATORIO),
    grupo_nome: z.string().min(1, CAMPO_OBRIGATORIO),
    array_operacoes: z.string().refine((data) => {
      const toArray = JSON.parse(data);
      if (toArray.length > 0) {
        return true;
      }
    }, CAMPO_OBRIGATORIO),
  });

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();
    return {
      errors: {
        tipo_nome: errors.tipo_nome?._errors[0],
        grupo_nome: errors.grupo_nome?._errors[0],
        array_operacoes: errors.array_operacoes?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const equipamentoTipo = await _createEquipamentoTipo(userToken, formData);
    if (equipamentoTipo.data) {
      return json({ error: equipamentoTipo.data });
    }
    setToastMessage(
      session,
      'Sucesso',
      'Tipo Equipamento adicionado!',
      'success'
    );
    return redirect('/equipamento_tipo', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    await _updateEquipamentoTipo(userToken, params.id as string, formData);
    setToastMessage(
      session,
      'Sucesso',
      'Tipo de equipamento editado!',
      'success'
    );
    return redirect('/equipamento_tipo', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return redirect('..');
}

export default function NewEquipamentoTipo() {
  const { equipamentoTipo, equipamentoGrupos, operacoes } =
    useLoaderData<typeof loader>();
  const [operacoesArray, setOperacoesArray] = useState([]);
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  const sortedGrupos: Option[] = equipamentoGrupos
    ?.filter((item: EquipamentoTipo) => !item?.inativo)
    ?.map((item: EquipamentoTipo) => {
      const { id, grupo_nome } = item;
      return {
        name: id || '',
        displayName: grupo_nome || '',
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  const handleChangeOperacoes = (operacoes: any) => {
    setOperacoesArray(operacoes);
  };

  return (
    <Modal
      title={`${equipamentoTipo ? 'Editar' : 'Adicionar'} Tipo de equipamento`}
      variant={equipamentoTipo ? 'grey' : 'blue'}
      content={
        <>
          <Row>
            <Input
              type="text"
              name="tipo_nome"
              label="Tipo Equipamento"
              defaultValue={equipamentoTipo?.tipo_nome}
              error={actionData?.errors?.tipo_nome}
              autoFocus
            />
            <Select
              name="grupo_nome"
              options={sortedGrupos}
              label="Grupo"
              defaultValue={equipamentoTipo?.grupo_nome}
              placeholder="-"
              error={actionData?.errors?.grupo_nome}
              className="w-60"
            />
          </Row>
          <input
            hidden
            name="array_operacoes"
            value={JSON.stringify(operacoesArray)}
          />
          <Row>
            <InputTag
              name="operacoes"
              label="Operações"
              data={operacoes?.items}
              defaultValue={equipamentoTipo?.array_operacoes}
              onChange={handleChangeOperacoes}
              placeholder="Digite apenas o código da operação e clique + para adicionar"
              error={actionData?.errors?.array_operacoes}
            />
          </Row>
        </>
      }
      footerActions={
        <Button
          variant={equipamentoTipo ? 'grey' : 'blue'}
          icon={
            isSubmitting ? (
              <SpinnerIcon />
            ) : equipamentoTipo ? (
              <PencilIcon />
            ) : (
              <PlusCircleIcon />
            )
          }
          text={equipamentoTipo ? 'Editar' : 'Adicionar'}
          name="_action"
          value={equipamentoTipo ? 'edit' : 'create'}
        />
      }
    ></Modal>
  );
}
