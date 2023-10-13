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
import { createOS, getOS, updateOS } from '~/models/ordem-servico.server';
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
    const OS = await getOS(userToken, params.id as string);
    return json({ OS });
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
      .startsWith('OS-', { message: 'OS-' })
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
    const OS = await createOS(userToken, formData);
    if (OS.data) {
      return json({ error: OS.data });
    }
    setToastMessage(
      session,
      'Sucesso',
      'Ordem de Serviço adicionada!',
      'success'
    );
    return redirect('/ordem-servico', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    await updateOS(userToken, params.id as string, formData);
    setToastMessage(session, 'Sucesso', 'Ordem de Serviço editada!', 'success');
    return redirect('/ordem-servico', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return redirect('..');
}

export default function NewOS() {
  const { OS } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  return (
    <Modal
      title={`${OS ? 'Editar' : 'Adicionar'} Ordem de Serviço`}
      variant={OS ? 'grey' : 'blue'}
      content={
        <>
          <Row>
            <Input
              type="text"
              name="codigo"
              label="Código"
              className="!w-24"
              defaultValue={OS ? OS?.codigo : 'OS-'}
              error={actionData?.errors?.codigo}
              disabled={OS}
            />
            <Input
              type="text"
              name="descricao"
              label="Descrição"
              defaultValue={OS?.descricao}
              error={actionData?.errors?.descricao}
              autoFocus
            />
          </Row>
          {actionData?.error && <ErrorMessage error={actionData?.error} />}
        </>
      }
      footerActions={
        <Button
          variant={OS ? 'grey' : 'blue'}
          icon={
            isSubmitting ? (
              <SpinnerIcon />
            ) : OS ? (
              <PencilIcon />
            ) : (
              <PlusCircleIcon />
            )
          }
          text={OS ? 'Editar' : 'Adicionar'}
          name="_action"
          value={OS ? 'edit' : 'create'}
        />
      }
    ></Modal>
  );
}
