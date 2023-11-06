import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from '@remix-run/node';
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import Button from '~/components/Button';
import Input from '~/components/Input';
import InputMask from '~/components/InputMask';
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
  COMBUSTIVEIS,
  INSTRUMENTOS_MEDICAO,
  CAMPO_OBRIGATORIO,
} from '~/utils/consts';
import {
  convertCurrencyStringToNumber,
  formatNumberWithDotDelimiter,
  removeIMSuffix,
} from '~/utils/utils';

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
    const equipamento: Equipamento = await getEquipamento(
      userToken,
      params.id as string
    );
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
    ano: z
      .string()
      .min(1, { message: 'Campo ...' })
      .refine((val) => +val > 1949, { message: 'Mín. 1950' }),
    combustivel: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    instrumento_medicao: z.string().refine((val) => val, CAMPO_OBRIGATORIO),
    frequencia_revisao: z.string().min(1, CAMPO_OBRIGATORIO),
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
        instrumento_medicao: errors.instrumento_medicao?._errors[0],
        instrumento_medicao_inicio:
          errors.instrumento_medicao_inicio?._errors[0],
        instrumento_medicao_atual: errors.instrumento_medicao_atual?._errors[0],
        frequencia_revisao: errors.frequencia_revisao?._errors[0],
        proxima_revisao: errors.proxima_revisao?._errors[0],
        obra: errors.obra?._errors[0],
        encarregado: errors.encarregado?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const body: Equipamento = {
      ...formData,
      valor_locacao_mensal: convertCurrencyStringToNumber(
        formData.valor_locacao_mensal as string
      ) as string,
      valor_locacao_diario: convertCurrencyStringToNumber(
        formData.valor_locacao_diario as string
      ) as string,
      valor_locacao_hora: convertCurrencyStringToNumber(
        formData.valor_locacao_hora as string
      ) as string,
      instrumento_medicao_atual: removeIMSuffix(
        formData.instrumento_medicao_inicio as string
      ),
      instrumento_medicao_inicio: removeIMSuffix(
        formData.instrumento_medicao_inicio as string
      ),
      frequencia_revisao: removeIMSuffix(formData.frequencia_revisao as string),
      proxima_revisao: String(
        +removeIMSuffix(formData.instrumento_medicao_inicio as string) +
          +removeIMSuffix(formData.frequencia_revisao as string)
      ),
    };
    const equipamento = await _createEquipamento(userToken, body);
    if (equipamento.data) {
      setToastMessage(session, 'Erro', 'Código já está em uso!', 'error');
      return redirect('./', {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }
    setToastMessage(session, 'Sucesso', 'Equipamento adicionado!', 'success');
    return redirect('/equipamento', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    const equipamento: Equipamento = await getEquipamento(
      userToken,
      params.id as string
    );

    // will throw toast message if new value is NOT greater than previous one.
    if (
      Number(removeIMSuffix(formData.instrumento_medicao_atual as string)) <
      Number(equipamento.instrumento_medicao_atual)
    ) {
      setToastMessage(
        session,
        'Erro',
        `${
          formData.instrumento_medicao === 'Horímetro'
            ? 'Horímetro'
            : 'Odômetro'
        } informado não pode ser menor que último valor (${formatNumberWithDotDelimiter(
          Number(equipamento.instrumento_medicao_atual)
        )})`,
        'error'
      );
      return redirect('./', {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    } else {
      const body: Equipamento = {
        ...formData,
        valor_locacao_mensal: convertCurrencyStringToNumber(
          formData.valor_locacao_mensal as string
        ) as string,
        valor_locacao_diario: convertCurrencyStringToNumber(
          formData.valor_locacao_diario as string
        ) as string,
        valor_locacao_hora: convertCurrencyStringToNumber(
          formData.valor_locacao_hora as string
        ) as string,
        instrumento_medicao_atual: removeIMSuffix(
          formData.instrumento_medicao_atual as string
        ),
        frequencia_revisao: removeIMSuffix(
          formData.frequencia_revisao as string
        ),
        proxima_revisao: equipamento.proxima_revisao,
      };
      await _updateEquipamento(
        userToken,
        params.id as string,
        body as Equipamento
      );
      setToastMessage(session, 'Sucesso', 'Equipamento editado!', 'success');
      return redirect('/equipamento', {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }
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
  const [selectedGrupo, setSelectedGrupo] = useState<Option | null>(null);
  const [codigoPrefix, setCodigoPrefix] = useState<string | null>(null);
  const [equipNumero, setEquipNumero] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [selectedIM, setSelectedIM] = useState<Option | null>(null);
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
  }, []);

  useEffect(() => {
    if (selectedIM) {
      if (selectedIM.name === 'Horímetro') {
        setSelectedIMSuffix(' h');
      }
      if (selectedIM.name === 'Odômetro') {
        setSelectedIMSuffix(' km');
      }
    }
  }, [selectedIM]);

  useEffect(() => {
    if (selectedGrupo) {
      setCodigoPrefix(selectedGrupo.displayName.charAt(0));
      if (selectedGrupo.displayName === 'Máquina') {
        setSelectedIM({ name: 'Horímetro', displayName: 'Horímetro' });
      } else {
        setSelectedIM({ name: 'Odômetro', displayName: 'Odômetro' });
      }
    }
  }, [selectedGrupo]);

  useEffect(() => {
    if (codigoPrefix && equipNumero) {
      setGeneratedCode(`${codigoPrefix}-${equipNumero}`);
    } else {
      setGeneratedCode('-');
    }
  }, [codigoPrefix, equipNumero]);

  const sortedObras: Option[] = obras
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

  const sortedTiposEquipamento: Option[] = tiposEquipamento
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

  const sortedGruposEquipamento: Option[] = gruposEquipamento
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
              onChange={setSelectedGrupo}
              disabled={equipamento?.grupo_equipamento}
            />
            <Select
              name="tipo_equipamento"
              options={sortedTiposEquipamento}
              label="Tipo"
              defaultValue={equipamento?.tipo_equipamento}
              placeholder="-"
              error={actionData?.errors?.tipo_equipamento}
            />
            <Input
              type="number"
              name="numero"
              label="Número"
              className="!w-[80px]"
              defaultValue={equipamento?.numero}
              error={actionData?.errors?.numero}
              onChange={setEquipNumero}
              disabled={equipamento?.numero}
              readOnly={equipamento?.numero}
            />
            <Input
              type="text"
              name="codigo"
              label="Código"
              className="!w-[80px]"
              defaultValue={equipamento ? equipamento?.codigo : generatedCode}
              error={actionData?.errors?.codigo}
              disabled
              readOnly
            />
          </Row>
          <input
            type="hidden"
            name="instrumento_medicao"
            value={selectedIM?.name}
          />
          <Row>
            <Input
              type="text"
              name="numero_serie"
              label="Número Série"
              defaultValue={equipamento?.numero_serie}
              error={actionData?.errors?.numero_serie}
            />
            <InputMask
              mask="9999"
              type="text"
              name="ano"
              label="Ano"
              defaultValue={equipamento?.ano}
              error={actionData?.errors?.ano}
              className="!w-20"
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
              type="IM"
              name={
                equipamento
                  ? 'instrumento_medicao_atual'
                  : 'instrumento_medicao_inicio'
              }
              label={`${selectedIM ? selectedIM.displayName : 'Valor'} ${
                equipamento ? 'atual' : 'inicial'
              }`}
              className="!w-[150px]"
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
              suffix={selectedIMSuffix}
            />
            <Input
              type="IM"
              name="frequencia_revisao"
              label="Revisar a cada"
              className="!w-[150px]"
              defaultValue={equipamento?.frequencia_revisao}
              error={actionData?.errors?.frequencia_revisao}
              suffix={selectedIMSuffix}
            />
            {equipamento && (
              <Input
                type="IM"
                name="proxima_revisao"
                label="Próxima revisão"
                className="!w-[150px]"
                defaultValue={equipamento?.proxima_revisao}
                error={actionData?.errors?.proxima_revisao}
                suffix={selectedIMSuffix}
              />
            )}
          </Row>
          <Row className="flex flex-col w-full border-t border-grey/30 pt-2">
            <label className="uppercase font-semibold text-xs">
              Valor da Locação
            </label>
            <div className="flex gap-4">
              <Input
                type="currency"
                name="valor_locacao_mensal"
                label="Mensal"
                className="!w-[150px]"
                defaultValue={equipamento?.valor_locacao_mensal}
                error={actionData?.errors?.valor_locacao_mensal}
                placeholder="Ex.: R$ 1.000,00"
              />
              <Input
                type="currency"
                name="valor_locacao_diario"
                label="Diário"
                className="!w-[150px]"
                defaultValue={equipamento?.valor_locacao_diario}
                error={actionData?.errors?.valor_locacao_diario}
                placeholder="Ex.: R$ 100,00"
              />
              <Input
                type="currency"
                name="valor_locacao_hora"
                label="Hora"
                className="!w-[150px]"
                defaultValue={equipamento?.valor_locacao_hora}
                error={actionData?.errors?.valor_locacao_hora}
                placeholder="Ex.: R$ 10,00"
              />
            </div>
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
