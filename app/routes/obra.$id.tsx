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
import InputMask from '~/components/InputMask';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import {
  type Obra,
  getObra,
  createObra,
  updateObra,
} from '~/models/obra.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import {
  capitalizeWords,
  compareDatesTest,
  convertDateToISO,
  convertISOToDate,
} from '~/utils/utils';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);

  if (params.id !== 'new') {
    const obra = await getObra(userToken, params.id as string);
    return json({ obra });
  }
  return json({});
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z
    .object({
      nome: z.string().min(1, { message: 'Campo obrigatório' }),
      cidade: z.string().min(1, { message: 'Campo obrigatório' }),
      data_inicio: z.string().min(1, { message: 'Campo obrigatório' }),
      data_final_previsto: z.string().min(1, { message: 'Campo obrigatório' }),
    })
    .refine(
      (schema) =>
        compareDatesTest(schema.data_inicio, schema.data_final_previsto),
      { message: 'Data inválida!' }
    );

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();

    return {
      errors: {
        nome: errors.nome?._errors[0],
        cidade: errors.cidade?._errors[0],
        data_inicio: errors.data_inicio?._errors[0],
        data_final_previsto: errors.data_final_previsto?._errors[0],
        invalidDate: errors?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const body: Obra = {
      ...formData,
      nome: capitalizeWords(formData.nome as string),
      cidade: capitalizeWords(formData.cidade as string),
      data_inicio: convertDateToISO(formData.data_inicio as string),
      data_final_previsto: convertDateToISO(
        formData.data_final_previsto as string
      ),
    };
    const obra = await createObra(userToken, body);
    if (obra.data) {
      return json({ error: obra.data });
    }
    setToastMessage(session, 'Sucesso', 'Obra adicionada!', 'success');
    return redirect('/obra', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    const editBody = {
      ...formData,
      nome: capitalizeWords(formData.nome as string),
      cidade: capitalizeWords(formData.cidade as string),
      data_inicio: convertDateToISO(formData.data_inicio as string),
      data_final_previsto: convertDateToISO(
        formData.data_final_previsto as string
      ),
    };
    await updateObra(userToken, params.id as string, editBody as Partial<Obra>);
    setToastMessage(session, 'Sucesso', 'Obra editada!', 'success');
    return redirect('/obra', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return redirect('..');
}

export default function NewObra() {
  const { obra } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  return (
    <Modal
      title={`${obra ? 'Editar' : 'Adicionar'} Obra`}
      variant={obra ? 'grey' : 'blue'}
      content={
        <>
          <Row>
            <Input
              type="text"
              name="nome"
              label="Nome"
              defaultValue={obra?.nome}
              error={actionData?.errors?.nome}
              autoFocus
            />
          </Row>
          <Row>
            <Input
              type="text"
              name="cidade"
              label="Cidade"
              defaultValue={obra?.cidade}
              error={actionData?.errors?.cidade}
            />
          </Row>
          <Row>
            <InputMask
              mask="99/99/9999"
              type="text"
              name="data_inicio"
              label="Data de início"
              defaultValue={convertISOToDate(obra?.data_inicio)}
              error={actionData?.errors?.data_inicio}
            />
            <InputMask
              mask="99/99/9999"
              type="text"
              name="data_final_previsto"
              label="Data final prevista"
              defaultValue={convertISOToDate(obra?.data_final_previsto)}
              error={
                actionData?.errors?.data_final_previsto ||
                actionData?.errors?.invalidDate
              }
            />
          </Row>
        </>
      }
      footerActions={
        <Button
          variant={obra ? 'grey' : 'blue'}
          icon={
            isSubmitting ? (
              <SpinnerIcon />
            ) : obra ? (
              <PencilIcon />
            ) : (
              <PlusCircleIcon />
            )
          }
          text={obra ? 'Editar' : 'Adicionar'}
          name="_action"
          value={obra ? 'edit' : 'create'}
        />
      }
    ></Modal>
  );
}
