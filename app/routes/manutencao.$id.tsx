import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from '@remix-run/node';
import {
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import Button from '~/components/Button';
import FileList from '~/components/FileList';
import FileUploader from '~/components/FileUploader';
import Input from '~/components/Input';
import InputMask from '~/components/InputMask';
import Modal from '~/components/Modal';
import RadioOptions from '~/components/RadioOptions';
import Row from '~/components/Row';
import Select from '~/components/Select';
import Textarea from '~/components/Textarea';
import InfoIcon from '~/components/icons/InfoIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { type Equipamento, getEquipamentos } from '~/models/equipamento.server';
import { type FileTypes, getFiles } from '~/models/files.server';
import {
  type Manutencao,
  _createManutencao,
  getManutencao,
  _updateManutencao,
} from '~/models/manutencao.server';
import { getOperadores } from '~/models/operador.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import {
  type Option,
  CAMPO_OBRIGATORIO,
  TIPOS_MANUTENCAO,
  TIPOS_REVISAO,
} from '~/utils/consts';
import {
  convertDateToISO,
  convertISOToDate,
  getCurrentDate,
  getTomorrowDate,
  isDateBefore,
  removeIMSuffix,
} from '~/utils/utils';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  const { searchParams } = new URL(request.url);
  const equipCodigo = searchParams.get('equip');
  // perPage to be set when need to get all items
  const operadores = await getOperadores(userToken, 'created', '', '', '500');
  const equipamentos = await getEquipamentos(userToken, 'created', '');

  if (params.id === 'new') {
    if (equipCodigo) {
      const findEquip = equipamentos?.items?.find(
        (item) => item.codigo === equipCodigo
      );
      return json({
        operadores,
        equipamentos,
        equipamento: {
          name: findEquip?.id,
          displayName: `${findEquip?.codigo} - ${findEquip?.tipo_equipamentoX}`,
          IM_atual: findEquip?.instrumento_medicao_atual,
        },
      });
    }
    return json({ operadores, equipamentos });
  } else {
    const manutencao = await getManutencao(userToken, params.id as string);
    const allFiles = await getFiles(userToken, 'manutencao');
    const files = allFiles?.filter(
      (item: FileTypes) => item.manutencao === params.id
    );

    return json({ operadores, equipamentos, manutencao, files });
  }
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  const validationScheme = z.object({
    tipo_manutencao: z.string(),
    data_manutencao: z.string().refine((val) => {
      return isDateBefore(val, getTomorrowDate());
    }, CAMPO_OBRIGATORIO),
    feito_por: z.string().min(1, CAMPO_OBRIGATORIO),
    equipamento: z.string().min(1, CAMPO_OBRIGATORIO),
    IM_atual: z.string().min(1, CAMPO_OBRIGATORIO),
    IM_atual_manual: z.string().min(1, CAMPO_OBRIGATORIO), // TODO: dynamically validate - only if revisao
    descricao: z.string().min(1, CAMPO_OBRIGATORIO),
  });

  const validatedScheme = validationScheme.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();
    return {
      errors: {
        tipo_manutencao: errors.tipo_manutencao?._errors[0],
        data_manutencao: errors.data_manutencao?._errors[0],
        feito_por: errors.feito_por?._errors[0],
        equipamento: errors.equipamento?._errors[0],
        IM_atual: errors.IM_atual?._errors[0],
        IM_atual_manual: errors.IM_atual_manual?._errors[0], // TODO: dynamically validate - only if revisao
        descricao: errors.descricao?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const body: Partial<Manutencao> = {
      ...formData,
      boletim: '-',
      data_manutencao: convertDateToISO(formData.data_manutencao as string),
      IM_atual: removeIMSuffix(formData.IM_atual as string),
      IM_atual_manual: removeIMSuffix(formData.IM_atual_manual as string),
    };
    const manutencao = await _createManutencao(userToken, body);

    if (manutencao.data) {
      return json({ error: manutencao.data });
    }
    setToastMessage(session, 'Sucesso', 'Manutenção adicionada!', 'success');
    return redirect(`/manutencao/${manutencao.id}`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    const editBody: Partial<Manutencao> = {
      ...formData,
      data_manutencao: convertDateToISO(formData.data_manutencao as string),
      IM_atual: removeIMSuffix(formData.IM_atual as string),
      IM_atual_manual: removeIMSuffix(formData.IM_atual_manual as string),
    };
    await _updateManutencao(
      userToken,
      params.id as string,
      editBody as Partial<Manutencao>
    );
    setToastMessage(session, 'Sucesso', 'Manutenção editada!', 'success');
    return redirect('/manutencao', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return redirect('..');
}

export default function NewManutencao() {
  const {
    manutencao,
    operadores,
    equipamentos,
    equipamento: paramEquipamento,
    files,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const equip = searchParams.get('equip');
  const isReadMode = searchParams.get('read');
  const isRevisao = manutencao?.tipo_manutencao === 'Revisão';
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';
  const [selectedEquipamento, setSelectedEquipamento] = useState<Option | null>(
    null
  );
  const uploadFileFetcher = useFetcher();
  const isUploadingFile =
    uploadFileFetcher.state === 'submitting' ||
    uploadFileFetcher.state === 'loading';

  const [equipamento, setEquipamento] = useState<Equipamento>(
    manutencao?.expand?.equipamento
  );
  const [selectedIMSuffix, setSelectedIMSuffix] = useState<string>();

  useEffect(() => {
    if (equipamento) {
      if (equipamento.instrumento_medicao === 'Horímetro') {
        setSelectedIMSuffix(' h');
      }
      if (equipamento.instrumento_medicao === 'Odômetro') {
        setSelectedIMSuffix(' km');
      }
    }
  }, [equipamento]);

  useEffect(() => {
    if (selectedEquipamento) {
      setEquipamento(
        equipamentos?.items?.find(
          (equip) => equip.id === selectedEquipamento.name
        ) || {}
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEquipamento]);

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
    formData.append('manutencao', manutencao.id);

    uploadFileFetcher.submit(formData, {
      method: 'post',
      action: '../../upload-file-manutencao',
      encType: 'multipart/form-data',
    });
  };

  return (
    <Modal
      title={`${isReadMode ? '' : manutencao ? 'Editar' : 'Adicionar'} ${
        equip || isRevisao ? 'Revisão' : 'Manutenção'
      }`}
      variant={isReadMode ? 'green' : manutencao ? 'grey' : 'blue'}
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
                {equip || isRevisao ? (
                  <RadioOptions
                    name="tipo_manutencao"
                    label={`Tipo de ${equip ? 'Serviço' : 'Manutenção'}:`}
                    options={TIPOS_REVISAO}
                    defaultValue="Revisão"
                    disabled={
                      (manutencao && manutencao?.boletim !== '-') ||
                      !!isReadMode
                    }
                  />
                ) : (
                  <RadioOptions
                    name="tipo_manutencao"
                    label="Tipo de Manutenção:"
                    options={TIPOS_MANUTENCAO}
                    defaultValue={manutencao?.tipo_manutencao}
                    disabled={
                      (manutencao && manutencao?.boletim !== '-') ||
                      !!isReadMode
                    }
                  />
                )}
              </Row>
              <Row>
                <InputMask
                  mask="99/99/9999"
                  type="text"
                  name="data_manutencao"
                  label="Data"
                  className="w-[120px]"
                  defaultValue={
                    manutencao
                      ? convertISOToDate(manutencao?.data_manutencao)
                      : getCurrentDate()
                  }
                  error={actionData?.errors?.data_manutencao}
                  disabled={
                    (manutencao && manutencao?.boletim !== '-') || !!isReadMode
                  }
                />
                <Select
                  name="feito_por"
                  options={sortedOperadores}
                  label="Feito por"
                  defaultValue={manutencao?.feito_por}
                  placeholder="-"
                  error={actionData?.errors?.feito_por}
                  disabled={
                    (manutencao && manutencao?.boletim !== '-') || !!isReadMode
                  }
                />
              </Row>
              <Row>
                <Select
                  name="equipamento"
                  options={sortedEquipamentos}
                  label="Código do Equipamento"
                  defaultValue={
                    paramEquipamento
                      ? paramEquipamento.name
                      : manutencao?.equipamento
                  }
                  placeholder="-"
                  error={actionData?.errors?.equipamento}
                  onChange={setSelectedEquipamento}
                  disabled={
                    (manutencao && manutencao?.boletim !== '-') ||
                    paramEquipamento ||
                    !!isReadMode ||
                    isRevisao
                  }
                />
              </Row>
              <Row>
                <Input
                  type="IM"
                  name="IM_atual"
                  className="w-[167px]"
                  label={`${
                    equipamento
                      ? equipamento?.instrumento_medicao
                      : 'Horím./Odôm.'
                  } ${isRevisao ? '(Ref.)' : 'Atual'}`}
                  defaultValue={
                    paramEquipamento
                      ? paramEquipamento?.IM_atual
                      : manutencao?.IM_atual
                  }
                  error={actionData?.errors?.IM_atual}
                  suffix={selectedIMSuffix}
                  disabled={
                    (manutencao && manutencao?.boletim !== '-') ||
                    paramEquipamento ||
                    !!isReadMode ||
                    isRevisao
                  }
                />
                {equip || isRevisao ? (
                  <Input
                    type="IM"
                    name="IM_atual_manual"
                    label="IM Verdadeiro"
                    className={
                      equip || isRevisao || manutencao ? 'w-[167px]' : ''
                    }
                    defaultValue={
                      paramEquipamento
                        ? paramEquipamento?.IM_atual_manual
                        : manutencao?.IM_atual_manual
                    }
                    error={actionData?.errors?.IM_atual_manual}
                    suffix={selectedIMSuffix}
                    disabled={!!isReadMode}
                  />
                ) : null}
              </Row>
              <Row>
                {manutencao?.boletim && (
                  <Input
                    type="text"
                    name="boletim"
                    label="Código do Boletim"
                    defaultValue={manutencao?.boletim}
                    error={actionData?.errors?.boletim}
                    disabled
                  />
                )}
              </Row>
              <Row>
                <Textarea
                  name="descricao"
                  label="Descrição"
                  defaultValue={manutencao?.descricao}
                  error={actionData?.errors?.descricao}
                  disabled={!!isReadMode}
                />
              </Row>
            </div>
            {files && (
              <div className="border-l border-grey/50 w-[300px]">
                {files && (
                  <Row className="pl-2">
                    <FileList files={files} path="manutencao" />
                  </Row>
                )}
                {manutencao && (
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
          {manutencao && manutencao?.boletim !== '-' && (
            <div className="flex items-center gap-1 mt-4">
              <InfoIcon className="h-5 w-5 text-orange" />
              <p>
                Manutenção criada através do Boletim{' '}
                {
                  <Link
                    to={`/boletim/${manutencao?.boletim}`}
                    className="font-semibold text-blue"
                  >
                    {manutencao?.boletim}
                  </Link>
                }
              </p>
            </div>
          )}
        </>
      }
      footerActions={
        isReadMode ? null : (
          <Button
            variant={manutencao ? 'grey' : 'blue'}
            icon={
              isSubmitting ? (
                <SpinnerIcon />
              ) : manutencao ? (
                <PencilIcon />
              ) : (
                <PlusCircleIcon />
              )
            }
            text={manutencao ? 'Editar' : 'Adicionar'}
            name="_action"
            value={manutencao ? 'edit' : 'create'}
          />
        )
      }
    ></Modal>
  );
}
