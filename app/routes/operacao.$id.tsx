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
import ErrorMessage from '~/components/ErrorMessage';
import Input from '~/components/Input';
import InputTag from '~/components/InputTag';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import {
  _createOperacao,
  _updateOperacao,
  getOperacao,
} from '~/models/operacao.server';
import { getOSs } from '~/models/ordem-servico.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { CAMPO_OBRIGATORIO } from '~/utils/consts';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  const OSs = await getOSs(userToken, 'created', '', '', '500');

  if (params.id === 'new') {
    return json({ OSs });
  } else {
    const operacao = await getOperacao(userToken, params.id as string);
    return json({ operacao, OSs });
  }
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z.object({
    codigo: z
      .string()
      .startsWith('OM-', { message: 'OM-' })
      .min(4, { message: 'Obrigatório' }),
    descricao: z.string().min(1, CAMPO_OBRIGATORIO),
    array_ordens_servico: z.string().refine((data) => {
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
        codigo: errors.codigo?._errors[0],
        descricao: errors.descricao?._errors[0],
        array_ordens_servico: errors.array_ordens_servico?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const operacao = await _createOperacao(userToken, formData);
    if (operacao.data) {
      return json({ error: operacao.data });
    }
    setToastMessage(session, 'Sucesso', 'Operação adicionada!', 'success');
    return redirect('/operacao', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    await _updateOperacao(userToken, params.id as string, formData);
    setToastMessage(session, 'Sucesso', 'Operação editada!', 'success');
    return redirect('/operacao', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return redirect('..');
}

export default function NewOS() {
  const { operacao, OSs } = useLoaderData<typeof loader>();
  const [OSarray, setOSArray] = useState([]);
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  const handleChangeOSs = (operacoes: any) => {
    setOSArray(operacoes);
  };

  return (
    <Modal
      title={`${operacao ? 'Editar' : 'Adicionar'} Operação`}
      variant={operacao ? 'grey' : 'blue'}
      content={
        <>
          <Row>
            <Input
              type="text"
              name="codigo"
              label="Código"
              className="!w-24"
              defaultValue={operacao ? operacao?.codigo : 'OM-'}
              error={actionData?.errors?.codigo}
              disabled={operacao}
            />
            <Input
              type="text"
              name="descricao"
              label="Descrição"
              defaultValue={operacao?.descricao}
              error={actionData?.errors?.descricao}
              autoFocus
            />
          </Row>
          {actionData?.error && <ErrorMessage error={actionData?.error} />}
          <input
            hidden
            name="array_ordens_servico"
            value={JSON.stringify(OSarray)}
          />
          <Row>
            <InputTag
              name="ordens_servico"
              label="Ordens de Serviço"
              data={OSs.items}
              defaultValue={operacao?.array_ordens_servico}
              onChange={handleChangeOSs}
              placeholder="Digite apenas o código da OS e clique + para adicionar"
              error={actionData?.errors?.array_ordens_servico}
            />
          </Row>
        </>
      }
      footerActions={
        <Button
          variant={operacao ? 'grey' : 'blue'}
          icon={
            isSubmitting ? (
              <SpinnerIcon />
            ) : operacao ? (
              <PencilIcon />
            ) : (
              <PlusCircleIcon />
            )
          }
          text={operacao ? 'Editar' : 'Adicionar'}
          name="_action"
          value={operacao ? 'edit' : 'create'}
        />
      }
    ></Modal>
  );
}
