/* eslint-disable react-hooks/exhaustive-deps */
import {
  type LoaderArgs,
  type ActionArgs,
  json,
  redirect,
} from '@remix-run/node';
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import Button from '~/components/Button';
import InputMask from '~/components/InputMask';
import Modal from '~/components/Modal';
import Row from '~/components/Row';
import Select from '~/components/Select';
import PencilIcon from '~/components/icons/PencilIcon';
import PlusCircleIcon from '~/components/icons/PlusCircleIcon';
import SpinnerIcon from '~/components/icons/SpinnerIcon';
import { getEquipamentos, type Equipamento } from '~/models/equipamento.server';
import { type Usuario, getUsuario } from '~/models/usuario.server';
import { CAMPO_OBRIGATORIO, type Option } from '~/utils/consts';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import {
  convertDateToISO,
  convertISOToDate,
  genCodigo,
  getCurrentDate,
  isTimeGreater,
} from '~/utils/utils';
import { useEffect, useState } from 'react';
import Input from '~/components/Input';
import { type Operador, getOperadores } from '~/models/operador.server';
import { type OS, getOSs } from '~/models/ordem-servico.server';
import { type Operacao, getOperacoes } from '~/models/operacao.server';
import InfoCircleIcon from '~/components/icons/InfoCircleIcon';
import { z } from 'zod';
import {
  type Boletim,
  getBoletins,
  _createBoletim,
  getBoletim,
  type EquipamentoLog,
  _updateBoletim,
} from '~/models/boletim.server';
import { PairLabelValue } from '~/components/PairLabelValue';
import TwoRowsInfo from '~/components/TwoRowsInfo';
import FooterSummaryBoletim from '~/components/FooterSummaryBoletim';
import InputValue from '~/components/InputValue';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken, userId } = await getUserSession(request);
  const loggedInUser: Usuario = await getUsuario(userToken, userId);
  const equipamentos = await getEquipamentos(userToken, 'created');
  const sortedEquipamentos: Option[] = equipamentos
    ?.map((item: Equipamento) => {
      const { id, codigo } = item;
      return {
        name: id,
        displayName: codigo,
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );

  const operad = await getOperadores(userToken, 'created');
  const operadores: Option[] = operad
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

  const OSs = await getOSs(userToken, 'created');
  const sortedOSs: Option[] = OSs?.map((item: OS) => {
    const { id, codigo } = item;
    return {
      name: id,
      displayName: codigo?.replace('OS-', ''),
    };
  })?.sort((a: Option, b: Option) =>
    a.displayName.localeCompare(b.displayName)
  );
  const operacoes = await getOperacoes(userToken, 'created');
  const sortedOperacoes: Option[] = operacoes
    ?.map((item: Operacao) => {
      const { id, codigo } = item;
      return {
        name: id,
        displayName: codigo?.replace('OM-', ''),
      };
    })
    ?.sort((a: Option, b: Option) =>
      a.displayName.localeCompare(b.displayName)
    );
  const boletins = await getBoletins(userToken, 'created');
  const newCode = genCodigo(boletins, 'BOL-');

  if (params.id === 'new') {
    return json({
      newCode,
      loggedInUser,
      equipamentos,
      sortedEquipamentos,
      operadores,
      sortedOSs,
      sortedOperacoes,
    });
  } else {
    const boletim = await getBoletim(userToken, params.id as string);
    return json({
      boletim,
      loggedInUser,
      equipamentos,
      sortedEquipamentos,
      operadores,
      sortedOSs,
      sortedOperacoes,
    });
  }
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());
  console.log('📘📘📘📘📘📘📘📘📘📘📘📘📘', formData);

  const equipamento_logs = [];
  for (let i = 0; i < Number(formData?.rows); i++) {
    equipamento_logs.push({
      index: i,
      OS: formData?.[`OS_${i}`],
      OP: formData?.[`operacao_${i}`],
      hora_inicio: formData?.[`hora_inicio_${i}`],
      hora_final: formData?.[`hora_final_${i}`],
      IM_inicio: formData?.[`IM_inicio_${i}`],
      IM_final: formData?.[`IM_final_${i}`],
    });
  }

  const validationSchema = z.object({
    data_boletim: z.string().min(1, CAMPO_OBRIGATORIO),
    equipamento: z.string().min(1, CAMPO_OBRIGATORIO),
    tipo_equipamento: z.string().min(1, CAMPO_OBRIGATORIO),
    operador: z.string().min(1, CAMPO_OBRIGATORIO),
  });

  const validatedSchema = validationSchema.safeParse(formData);

  if (!validatedSchema.success) {
    const errors = validatedSchema.error.format();
    console.log('📕📕📕📕📕📕📕📕📕📕📕📕📕📕', errors);

    return {
      errors: {
        data_boletim: errors.data_boletim?._errors[0],
        equipamento: errors.equipamento?._errors[0],
        tipo_equipamento: errors.tipo_equipamento?._errors[0],
        operador: errors.operador?._errors[0],
        invalidInput: errors?._errors[0],
      },
    };
  }

  if (formData._action === 'create') {
    const body = {
      ...formData,
      codigo: `BOL-${formData?.newCode}`,
      data_boletim: convertDateToISO(formData?.data_boletim as string),
      equipamento_logs,
      obra: formData.obra,
      encarregado: formData.encarregado,
    };

    const boletim = await _createBoletim(userToken, body as Boletim);

    if (boletim.data) {
      return json({ error: boletim.data });
    }
    setToastMessage(session, 'Sucesso', 'Boletim adicionado!', 'success');
    return redirect('/boletim', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData._action === 'edit') {
    const body = {
      ...formData,
      data_boletim: convertDateToISO(formData?.data_boletim as string),
      equipamento_logs,
      obra: formData.obra,
      encarregado: formData.encarregado,
    };

    const boletim = await _updateBoletim(
      userToken,
      params.id as string,
      body as Boletim
    );

    if (boletim.data) {
      return json({ error: boletim.data });
    }
    setToastMessage(session, 'Sucesso', 'Boletim adicionado!', 'success');
    return redirect('/boletim', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  return json({});
}

export default function NewBoletim() {
  const {
    newCode,
    boletim,
    loggedInUser,
    equipamentos,
    sortedEquipamentos,
    operadores,
    sortedOSs,
    sortedOperacoes,
  } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  //STATES
  const [dataBoletim, setDataBoletim] = useState<string>(getCurrentDate()); //Data
  const [equipamento, setEquipamento] = useState<Equipamento>(); //Equipamento

  const [actionErrors, setActionErrors] = useState<{ [key: string]: string }>(); //Errors
  const [rows, setRows] = useState<number>(); // Log Rows
  const [logs, setLogs] = useState<EquipamentoLog[]>([]);

  const handleSelectEquipamento = (option: Option) => {
    const findEquipamento = equipamentos.find(
      (equip: Equipamento) => equip.id === option.name
    );
    setEquipamento(findEquipamento);
  };

  useEffect(() => {
    //create
    if (!boletim) {
      setRows(1);
    }

    //edit
    if (boletim) {
      const findEquipamento = equipamentos.find(
        (equip: Equipamento) => equip.id === boletim?.equipamento
      );
      setEquipamento(findEquipamento);
      setRows(boletim?.equipamento_logs?.length);
      setLogs(boletim?.equipamento_logs);
    }
  }, []);

  useEffect(() => {
    setActionErrors(actionData?.errors);
  }, [actionData]);

  return (
    <Modal
      size="xxl"
      title={`${boletim ? 'Editar' : 'Adicionar'} Boletim`}
      variant={boletim ? 'grey' : 'blue'}
      content={
        <div className="flex">
          <div className="pr-4 border-r-grey/40 border-r">
            {/* TODO: revisit if this fixed height helps or not */}
            <Row className="h-20">
              <InputMask
                mask="99/99/9999"
                type="text"
                name="data_boletim"
                label="Data de início"
                value={dataBoletim}
                className="!w-[132px]"
                onChange={setDataBoletim}
                error={actionErrors?.data_boletim}
              />
              <Select
                name="equipamento"
                options={sortedEquipamentos}
                label="Equipamento"
                value={boletim?.equipamento}
                placeholder="-"
                className="!w-[132px]"
                onChange={handleSelectEquipamento}
                error={actionErrors?.equipamento}
              />
              <Input
                type="text"
                name="tipo_equipamento"
                label="Tipo do equipamento"
                className="!w-[280px]"
                disabled
                tabIndex={-1}
                defaultValue={equipamento?.tipo_equipamentoX}
                error={actionErrors?.tipo_equipamento}
              />
              <Select
                name="operador"
                options={operadores}
                label="Operador"
                value={boletim?.operador}
                placeholder="-"
                className="!w-[280px]"
                error={actionErrors?.operador}
              />
            </Row>
            <input type="hidden" name="rows" value={rows} />
            <input type="hidden" name="obra" value={loggedInUser?.obra} />
            <input type="hidden" name="encarregado" value={loggedInUser?.id} />
            <input type="hidden" name="newCode" value={newCode} />
            <div className="mt-4 h-full scrollbar-thin scrollbar-thumb-grey/30 scrollbar-thumb-rounded pr-2">
              {Array.from(new Array(rows), (_, index) => {
                return (
                  <Row key={index} className="h-20">
                    <Select
                      className="!w-[132px]"
                      name={`OS_${index}`}
                      options={sortedOSs}
                      noLabel={index !== 0}
                      labelBold
                      label="O.S."
                      placeholder="-"
                      value={logs[index]?.OP || ''}
                    />
                    <Select
                      className="!w-[132px]"
                      name={`operacao_${index}`}
                      options={sortedOperacoes}
                      noLabel={index !== 0}
                      label="Operação"
                      labelBold
                      placeholder="-"
                      value={logs ? logs[index]?.OP : ''}
                    />
                    {/* <InputValue
                      type="time"
                      className="!w-[132px]"
                      name={`hora_inicio_${index}`}
                      noLabel={index !== 0}
                      label="Hora Início"
                      labelBold
                      value={logs ? logs[index]?.hora_inicio : ''}
                    />
                    <InputValue
                      type="time"
                      className="!w-[132px]"
                      name={`hora_final_${index}`}
                      noLabel={index !== 0}
                      label="Hora Final"
                      labelBold
                      value={logs ? logs[index]?.hora_final : ''}
                    />
                    <InputValue
                      type="IM"
                      className="!w-[130px]"
                      name={`IM_inicio_${index}`}
                      noLabel={index !== 0}
                      label={`${
                        equipamento?.instrumento_medicao
                          ? equipamento?.instrumento_medicao
                          : 'IM'
                      } Início`}
                      labelBold
                      value={logs ? logs[index]?.IM_inicio : ''}
                    />
                    <InputValue
                      type="IM"
                      className="!w-[130px]"
                      name={`IM_final_${index}`}
                      noLabel={index !== 0}
                      label={`${
                        equipamento?.instrumento_medicao
                          ? equipamento?.instrumento_medicao
                          : 'IM'
                      } Final`}
                      labelBold
                      value={logs ? logs[index]?.IM_final : ''}
                    /> */}
                  </Row>
                );
              })}
              {/* <TwoRowsInfo OS={OS} OP={OP} /> */}
            </div>
          </div>
          {/* <div className="w-full pl-4">Combustivel + Arquivos</div> */}
        </div>
      }
      // footerSummary={
      //   <FooterSummaryBoletim
      //     loggedInUser={loggedInUser}
      //     equipamento={equipamento}
      //   />
      // }
      footerActions={
        <Button
          variant={boletim ? 'grey' : 'blue'}
          icon={
            isSubmitting ? (
              <SpinnerIcon />
            ) : boletim ? (
              <PencilIcon />
            ) : (
              <PlusCircleIcon />
            )
          }
          text={boletim ? 'Editar' : 'Adicionar'}
          name="_action"
          value={boletim ? 'edit' : 'create'}
        />
      }
    />
  );
}
