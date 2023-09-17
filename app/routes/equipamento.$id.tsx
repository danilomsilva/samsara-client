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
import {
  type Equipamento,
  _createEquipamento,
  _updateEquipamento,
  getEquipamento,
  type TipoEquipamento,
  getTiposEquipamento,
  type GrupoEquipamento,
  getGruposEquipamento,
} from '~/models/equipamento.server';
import { type Obra, getObras } from '~/models/obra.server';
import { type Usuario, getUsuarios } from '~/models/usuario.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import {
  type Option,
  TIPOS_LOCACAO,
  COMBUSTIVEIS,
  INSTRUMENTOS_MEDICAO,
  CAMPO_OBRIGATORIO,
} from '~/utils/consts';
import { convertCurrencyStringToNumber } from '~/utils/utils';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);

  const tiposEquipamento: TipoEquipamento[] = await getTiposEquipamento(
    userToken,
    'created'
  );
  const gruposEquipamento: GrupoEquipamento[] = await getGruposEquipamento(
    userToken,
    'created'
  );
  const obras: Obra[] = await getObras(userToken, 'created');
  const usuarios: Usuario[] = await getUsuarios(userToken, 'created');
  const encarregados = usuarios
    .filter((usuario) => usuario.tipo_acesso === 'Encarregado')
    .map((usuario) => ({
      name: usuario?.id,
      displayName: usuario?.nome_completo,
    }));
  if (params.id === 'new') {
    return json({ obras, encarregados, gruposEquipamento, tiposEquipamento });
  } else {
    const equipamento = await getEquipamento(userToken, params.id as string);
    return json({
      obras,
      encarregados,
      equipamento,
      gruposEquipamento,
      tiposEquipamento,
    });
  }
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  const genericSchema = {
    grupo_equipamento: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    tipo_equipamento: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    numero: z.string().min(1, { message: 'Campo ...' }),
    codigo: z.string(),
    numero_serie: z.string().min(1, CAMPO_OBRIGATORIO),
    ano: z.string().min(1, { message: 'Campo ...' }),
    combustivel: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    valor_locacao: z.string().min(1, CAMPO_OBRIGATORIO),
    tipo_locacao: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    instrumento_medicao: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    frequencia_revisao: z.string().min(1, CAMPO_OBRIGATORIO),
    notificar_revisao_faltando: z.string().min(1, CAMPO_OBRIGATORIO),
    obra: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    encarregado: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
  };

  const validationSchema = z.object(
    formData._action === 'create'
      ? {
          ...genericSchema,
          instrumento_medicao_inicio: z.string().min(1, CAMPO_OBRIGATORIO),
        }
      : {
          ...genericSchema,
          instrumento_medicao_atual: z.string().min(1, CAMPO_OBRIGATORIO),
        }
  );

  const validatedScheme = validationSchema.safeParse(formData);

  if (!validatedScheme.success) {
    const errors = validatedScheme.error.format();
    return {
      errors: {
        grupo_equipamento: errors.grupo_equipamento?._errors[0],
        tipo_equipamento: errors.tipo_equipamento?._errors[0],
        numero: errors.numero?._errors[0],
        codigo: errors.codigo?._errors[0],
        numero_serie: errors.numero_serie?._errors[0],
        ano: errors.ano?._errors[0],
        combustivel: errors.combustivel?._errors[0],
        valor_locacao: errors.valor_locacao?._errors[0],
        tipo_locacao: errors.tipo_locacao?._errors[0],
        instrumento_medicao: errors.instrumento_medicao?._errors[0],
        instrumento_medicao_inicio:
          errors.instrumento_medicao_inicio?._errors[0],
        instrumento_medicao_atual: errors.instrumento_medicao_atual?._errors[0],
        frequencia_revisao: errors.frequencia_revisao?._errors[0],
        notificar_revisao_faltando:
          errors.notificar_revisao_faltando?._errors[0],
        obra: errors.obra?._errors[0],
        encarregado: errors.encarregado?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const body = {
      ...formData,
      valor_locacao: convertCurrencyStringToNumber(
        formData.valor_locacao as string
      ) as string,
      instrumento_medicao_atual: formData.instrumento_medicao_inicio as string,
    };
    const equipamento = await _createEquipamento(userToken, body);
    if (equipamento.data) {
      return json({ error: equipamento.data });
    }
    setToastMessage(session, 'Sucesso', 'Equipamento adicionado!', 'success');
    return redirect('/equipamento', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    await _updateEquipamento(
      userToken,
      params.id as string,
      formData as Equipamento
    );
    setToastMessage(session, 'Sucesso', 'Equipamento editado!', 'success');
    return redirect('/equipamento', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return redirect('..');
}

export default function NewEquipamento() {
  const {
    gruposEquipamento,
    tiposEquipamento,
    equipamento,
    obras,
    encarregados,
  } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  const sortedObras: Option[] = obras // TODO: create a function to sort and return Option type
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

  const sortedTiposEquipamento: Option[] = tiposEquipamento // TODO: create a function to sort and return Option type
    ?.map((item: TipoEquipamento) => {
      const { id, tipo_nome } = item;
      return {
        name: id,
        displayName: tipo_nome,
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  const sortedGruposEquipamento: Option[] = gruposEquipamento // TODO: create a function to sort and return Option type
    ?.map((item: GrupoEquipamento) => {
      const { id, grupo_nome } = item;
      return {
        name: id,
        displayName: grupo_nome,
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  return (
    <Modal
      title={`${equipamento ? 'Editar' : 'Adicionar'} Equipamento`}
      variant={equipamento ? 'grey' : 'blue'}
      size="lg"
      content={
        <div className="flex flex-col gap-6">
          <Row>
            <Select
              name="grupo_equipamento"
              options={sortedGruposEquipamento}
              label="Grupo"
              defaultValue={equipamento?.grupo_equipamento}
              placeholder="-"
              error={actionData?.errors?.grupo_equipamento}
            />
            <Select
              name="tipo_equipamento" // TODO: Do not consider accents
              options={sortedTiposEquipamento}
              label="Tipo"
              defaultValue={equipamento?.tipo_equipamento}
              placeholder="-"
              error={actionData?.errors?.tipo_equipamento}
            />
            <Input
              type="number" //TODO: support only integers
              name="numero"
              label="Número"
              className="!w-[80px]"
              defaultValue={equipamento?.numero}
              error={actionData?.errors?.numero}
            />
            <Input
              type="text"
              name="codigo"
              label="Código"
              className="!w-[80px]"
              defaultValue={equipamento ? equipamento?.codigo : '-'} // TODO: auto create codigo prefix
              error={actionData?.errors?.codigo}
              disabled
            />
          </Row>
          <Row>
            <Input
              type="text"
              name="numero_serie"
              label="Número Série"
              defaultValue={equipamento?.numero_serie}
              error={actionData?.errors?.numero_serie}
            />
            <Input
              type="text"
              name="ano"
              label="Ano"
              className="!w-[80px]"
              defaultValue={equipamento?.ano}
              error={actionData?.errors?.ano}
            />
            <Select
              name="combustivel"
              options={COMBUSTIVEIS}
              label="Combustível"
              className="!w-[175px]"
              placeholder="-"
              defaultValue={equipamento?.combustivel}
              error={actionData?.errors?.combustivel}
            />
          </Row>
          <Row>
            <Input
              type="currency"
              name="valor_locacao"
              label="Valor de Locação"
              className="!w-[165px]"
              defaultValue={equipamento?.valor_locacao}
              error={actionData?.errors?.valor_locacao}
            />
            <Select
              name="tipo_locacao"
              options={TIPOS_LOCACAO}
              label="Tipo de Locação"
              className="!w-[180px]"
              placeholder="-"
              defaultValue={equipamento?.tipo_locacao}
              error={actionData?.errors?.tipo_locacao}
            />
          </Row>
          <Row>
            <Select
              name="instrumento_medicao"
              options={INSTRUMENTOS_MEDICAO}
              label="Instrumento de Medição"
              className="!w-[165px]"
              placeholder="-"
              defaultValue={equipamento?.instrumento_medicao}
              error={actionData?.errors?.instrumento_medicao}
            />
            <Input
              type="number"
              name={
                equipamento // TODO: check if atual value is equal or bigger than initial - do API call
                  ? 'instrumento_medicao_atual'
                  : 'instrumento_medicao_inicio'
              }
              label={`${
                equipamento
                  ? equipamento.instrumento_medicao === 'Horímetro'
                    ? 'Horímetro '
                    : 'Odômetro '
                  : 'Hor./Odôm. '
              }${equipamento ? 'atual' : 'inicial'}`}
              className="!w-[180px]"
              defaultValue={
                equipamento
                  ? equipamento?.instrumento_medicao_atual
                  : equipamento?.instrumento_medicao_inicio
              }
              error={
                equipamento
                  ? actionData?.errors?.instrumento_medicao_atual
                  : actionData?.errors?.instrumento_medicao_inicio
              }
            />
            <Input
              type="number"
              name="frequencia_revisao"
              label="Revisar a cada"
              className="!w-[130px]"
              defaultValue={equipamento?.frequencia_revisao}
              error={actionData?.errors?.frequencia_revisao}
            />
            <Input
              type="number"
              name="notificar_revisao_faltando"
              label="Notificar faltando"
              className="!w-[130px]"
              defaultValue={equipamento?.notificar_revisao_faltando}
              error={actionData?.errors?.notificar_revisao_faltando}
            />
          </Row>
          <Row>
            <Select
              name="obra"
              options={sortedObras}
              label="Alocado à obra"
              placeholder="-"
              defaultValue={equipamento?.obra}
              error={actionData?.errors?.obra}
            />
            <Select
              name="encarregado"
              options={encarregados}
              label="Encarregado"
              defaultValue={equipamento?.encarregado}
              placeholder="-"
              error={actionData?.errors?.encarregado}
            />
          </Row>
        </div>
      }
      footerActions={
        <Button
          variant={equipamento ? 'grey' : 'blue'}
          icon={
            isSubmitting ? (
              <SpinnerIcon />
            ) : equipamento ? (
              <PencilIcon />
            ) : (
              <PlusCircleIcon />
            )
          }
          text={equipamento ? 'Editar' : 'Adicionar'}
          name="_action"
          value={equipamento ? 'edit' : 'create'}
        />
      }
    />
  );
}
