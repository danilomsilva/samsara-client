import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from '@remix-run/node';
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import { z } from 'zod';
import Button from '~/components/Button';
import FileList from '~/components/FileList';
import FileUploader from '~/components/FileUploader';
import Input from '~/components/Input';
import InputMask from '~/components/InputMask';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import Select from '~/components/Select';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { getEquipamentos } from '~/models/equipamento.server';
import { type FileTypes, getFiles } from '~/models/files.server';
import {
  type Multa,
  _createMulta,
  getMulta,
  _updateMulta,
} from '~/models/multa.server';
import { getOperadores } from '~/models/operador.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type Option, CAMPO_OBRIGATORIO } from '~/utils/consts';
import {
  checkDateValid,
  convertCurrencyStringToNumber,
  convertDateToISO,
  convertISOToDate,
} from '~/utils/utils';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  const operadores = await getOperadores(userToken, 'created', '', '', '500');
  const equipamentos = await getEquipamentos(
    userToken,
    'created',
    '',
    '',
    '500'
  );
  const allFiles = await getFiles(userToken, 'multa');
  const files = allFiles?.filter((item: FileTypes) => item.multa === params.id);
  if (params.id === 'new') {
    return json({ operadores, equipamentos });
  } else {
    const multa = await getMulta(userToken, params.id as string);
    return json({ multa, operadores, equipamentos, files });
  }
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z
    .object({
      data_infracao: z.string().min(1, CAMPO_OBRIGATORIO),
      codigo_infracao: z.string().min(1, CAMPO_OBRIGATORIO),
      valor_infracao: z.string().min(1, CAMPO_OBRIGATORIO),
      condutor: z.string().min(1, CAMPO_OBRIGATORIO),
      equipamento: z.string().min(1, CAMPO_OBRIGATORIO),
    })
    .refine((schema) => checkDateValid(schema.data_infracao), {
      message: 'Data inválida!',
    });

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();

    return {
      errors: {
        data_infracao: errors.data_infracao?._errors[0],
        codigo_infracao: errors.codigo_infracao?._errors[0],
        valor_infracao: errors.valor_infracao?._errors[0],
        condutor: errors.condutor?._errors[0],
        equipamento: errors.equipamento?._errors[0],
        invalidDate: errors?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const body: Multa = {
      ...formData,
      data_infracao: convertDateToISO(formData.data_infracao as string),
      valor_infracao: Number(
        convertCurrencyStringToNumber(formData.valor_infracao as string)
      ) as number,
    };
    const multa = await _createMulta(userToken, body);
    if (multa.data) {
      return json({ error: multa.data });
    }
    setToastMessage(session, 'Sucesso', 'Multa adicionada!', 'success');
    return redirect('/multa', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    const body: Multa = {
      ...formData,
      data_infracao: convertDateToISO(formData.data_infracao as string),
      valor_infracao: Number(
        convertCurrencyStringToNumber(formData.valor_infracao as string)
      ) as number,
    };
    const multa = await _updateMulta(userToken, params.id as string, body);
    if (multa.data) {
      return json({ error: multa.data });
    }
    setToastMessage(session, 'Sucesso', 'Multa atualizada!', 'success');
    return redirect('/multa', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  return redirect('..');
}

export default function NewMulta() {
  const { operadores, equipamentos, files, multa } =
    useLoaderData<typeof loader>();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const isReadMode = searchParams.get('read');
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  const uploadFileFetcher = useFetcher();
  const isUploadingFile =
    uploadFileFetcher.state === 'submitting' ||
    uploadFileFetcher.state === 'loading';

  const sortedOperadores: Option[] = operadores?.items
    ?.filter((item) => !item?.inativo)
    ?.map((item) => {
      const { id, nome_completo } = item;
      return {
        name: id || '',
        displayName: nome_completo || '',
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  const sortedEquipamentos: Option[] = equipamentos?.items
    ?.filter((item) => !item?.inativo)
    ?.map((item) => {
      const { id, codigo, tipo_equipamentoX, modelo } = item;
      return {
        name: id || '',
        displayName: `${codigo} - ${tipo_equipamentoX} - ${modelo}` || '',
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  const handleFileUpload = async (files: File[]) => {
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('name', files[0]?.name ?? '');
    formData.append('multa', multa.id);

    uploadFileFetcher.submit(formData, {
      method: 'post',
      action: '../../upload-file-multa',
      encType: 'multipart/form-data',
    });
  };

  return (
    <Modal
      title={`${isReadMode ? '' : multa ? 'Editar' : 'Adicionar'} Multa`}
      variant={isReadMode ? 'green' : multa ? 'grey' : 'blue'}
      size={files ? 'lg' : 'md'}
      content={
        <>
          <div
            className={`${
              files ? 'grid-cols-[350px_350px] gap-4' : 'grid-cols-1'
            } grid`}
          >
            <div className="flex flex-col gap-2">
              <Row>
                <InputMask
                  mask="99/99/9999"
                  type="text"
                  name="data_infracao"
                  label="Data da Infração"
                  defaultValue={convertISOToDate(multa?.data_infracao)}
                  className="!w-36"
                  error={
                    actionData?.errors?.data_infracao ||
                    actionData?.errors?.invalidDate
                  }
                  disabled={!!isReadMode}
                />
                <Input
                  type="text"
                  name="codigo_infracao"
                  label="Código da Infração"
                  defaultValue={multa?.codigo_infracao}
                  error={actionData?.errors?.nome}
                  disabled={!!isReadMode}
                />
              </Row>
              <Row>
                <Input
                  type="currency"
                  name="valor_infracao"
                  label="Valor da Infração"
                  defaultValue={multa?.valor_infracao}
                  error={actionData?.errors?.valor_infracao}
                  className="!w-36"
                  placeholder="Ex.: R$ 1.000,00"
                  disabled={!!isReadMode}
                />
                <Select
                  name="condutor"
                  options={sortedOperadores}
                  label="Condutor"
                  defaultValue={multa?.condutor}
                  placeholder="-"
                  error={actionData?.errors?.condutor}
                  disabled={!!isReadMode}
                />
              </Row>
              <Row>
                <Select
                  name="equipamento"
                  options={sortedEquipamentos}
                  label="Código do Equipamento"
                  defaultValue={multa?.equipamento}
                  placeholder="-"
                  error={actionData?.errors?.equipamento}
                  disabled={!!isReadMode}
                />
              </Row>
            </div>
            {files && (
              <div className="border-l border-grey/50 w-[300px]">
                {files && (
                  <Row className="pl-2">
                    <FileList files={files} path="multa" />
                  </Row>
                )}
                {multa && (
                  <Row>
                    <FileUploader
                      onChange={handleFileUpload}
                      isUploadingFile={isUploadingFile}
                    />
                  </Row>
                )}
              </div>
            )}
          </div>
        </>
      }
      footerActions={
        isReadMode ? null : (
          <Button
            variant={multa ? 'grey' : 'blue'}
            icon={
              isSubmitting ? (
                <SpinnerIcon />
              ) : multa ? (
                <PencilIcon />
              ) : (
                <PlusCircleIcon />
              )
            }
            text={multa ? 'Editar' : 'Adicionar'}
            name="_action"
            value={multa ? 'edit' : 'create'}
          />
        )
      }
    ></Modal>
  );
}
