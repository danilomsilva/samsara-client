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
import RadioOptions from '~/components/RadioOptions';
import Row from '~/components/Row';
import Select from '~/components/Select';
import Textarea from '~/components/Textarea';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { type Equipamento, getEquipamentos } from '~/models/equipamento.server';
import {
  type Manutencao,
  _createManutencao,
  getManutencao,
  _updateManutencao,
} from '~/models/manutencao.server';
import { type Operador, getOperadores } from '~/models/operador.server';
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

  if (params.id === 'new') {
    const operadores = await getOperadores(userToken, 'created');
    const equipamentos = await getEquipamentos(userToken, 'created');
    return json({ operadores, equipamentos });
  } else {
    const operadores = await getOperadores(userToken, 'created');
    const equipamentos = await getEquipamentos(userToken, 'created');
    const manutencao = await getManutencao(userToken, params.id as string);
    return json({ operadores, equipamentos, manutencao });
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
    boletim: z.string().min(1, CAMPO_OBRIGATORIO),
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
        boletim: errors.boletim?._errors[0],
        descricao: errors.descricao?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const body: Partial<Manutencao> = {
      ...formData,
      data_manutencao: convertDateToISO(formData.data_manutencao as string),
      IM_atual: removeIMSuffix(formData.IM_atual as string),
    };
    const manutencao = await _createManutencao(userToken, body);

    if (manutencao.data) {
      return json({ error: manutencao.data });
    }
    setToastMessage(session, 'Sucesso', 'Manutenção adicionada!', 'success');
    return redirect('/manutencao', {
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

export default function NewOperador() {
  const { manutencao, operadores, equipamentos } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';
  const [selectedEquipamento, setSelectedEquipamento] = useState<Option | null>(
    null
  );
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
        equipamentos.find(
          (equip: Equipamento) => equip.id === selectedEquipamento.name
        )
      );
    }
  }, [selectedEquipamento]);

  const sortedOperadores: Option[] = operadores
    ?.map((item: Operador) => {
      const { id, nome_completo } = item;
      return {
        name: id,
        displayName: nome_completo,
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  const sortedEquipamentos: Option[] = equipamentos
    ?.map((item: Equipamento) => {
      const { id, codigo, tipo_equipamentoX } = item;
      return {
        name: id,
        displayName: `${codigo} - ${tipo_equipamentoX}`,
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  return (
    <Modal
      title={`${manutencao ? 'Editar' : 'Adicionar'} Manutenção`}
      variant={manutencao ? 'grey' : 'blue'}
      content={
        <>
          <Row>
            <RadioOptions
              name="tipo_manutencao"
              label="Tipo de Manutenção:"
              options={TIPOS_MANUTENCAO}
              defaultValue={manutencao?.tipo_manutencao}
            />
          </Row>
          <Row>
            <InputMask
              mask="99/99/9999"
              type="text"
              name="data_manutencao"
              label="Data"
              defaultValue={
                manutencao
                  ? convertISOToDate(manutencao?.data_manutencao)
                  : getCurrentDate()
              }
              error={actionData?.errors?.data_manutencao}
            />
            <Select
              name="feito_por"
              options={sortedOperadores}
              label="Feito por"
              defaultValue={manutencao?.feito_por}
              placeholder="-"
              error={actionData?.errors?.feito_por}
            />
          </Row>
          <Row>
            <Select
              name="equipamento"
              options={sortedEquipamentos}
              label="Código do Equipamento"
              defaultValue={manutencao?.equipamento}
              placeholder="-"
              error={actionData?.errors?.equipamento}
              onChange={setSelectedEquipamento}
            />
            <Input
              type="IM"
              name="IM_atual"
              label={`${
                equipamento ? equipamento?.instrumento_medicao : 'Horím./Odôm.'
              }`}
              className="!w-[130px]"
              defaultValue={manutencao?.IM_atual}
              error={actionData?.errors?.IM_atual}
              suffix={selectedIMSuffix}
            />
          </Row>
          <Row>
            {/* <Select
              name="boletim" // TODO: after boletim is complete, provide list of codigos so it can be selected!
              options={sortedEquipamentos}
              label="Código do Boletim"
              defaultValue={manutencao?.boletim}
              placeholder="-"
              error={actionData?.errors?.boletim}
            /> */}
            <Input
              type="text"
              name="boletim"
              label="Código do Boletim"
              defaultValue={manutencao?.boletim}
              error={actionData?.errors?.boletim}
            />
          </Row>
          <Row>
            <Textarea
              name="descricao"
              label="Descrição"
              defaultValue={manutencao?.descricao}
              error={actionData?.errors?.descricao}
            />
          </Row>
        </>
      }
      footerActions={
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
      }
    ></Modal>
  );
}
