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
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import {
  createOperacao,
  getOperacao,
  updateOperacao,
} from '~/models/operacao.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { CAMPO_OBRIGATORIO } from '~/utils/consts';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);

  if (params.id !== 'new') {
    const operacao = await getOperacao(userToken, params.id as string);
    return json({ operacao });
  }
  return json({});
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
  });

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();
    return {
      errors: {
        codigo: errors.codigo?._errors[0],
        descricao: errors.descricao?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const operacao = await createOperacao(userToken, formData);
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
    await updateOperacao(userToken, params.id as string, formData);
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
  const { operacao } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

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
