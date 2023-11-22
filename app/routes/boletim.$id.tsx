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
  removeIMSuffix,
} from '~/utils/utils';
import { useEffect, useState } from 'react';
import { type Operador, getOperadores } from '~/models/operador.server';
import { type OS, getOSs } from '~/models/ordem-servico.server';
import { type Operacao, getOperacoes } from '~/models/operacao.server';
import { z } from 'zod';
import {
  type Boletim,
  getBoletins,
  _createBoletim,
  getBoletim,
  type EquipamentoLog,
  _updateBoletim,
} from '~/models/boletim.server';
import FooterSummary from '~/components/FooterSummary';
import InputValue from '~/components/InputValue';
import TwoLinesInfo from '~/components/TwoLinesInfo';
import Checkbox from '~/components/Checkbox';
import Textarea from '~/components/Textarea';
import { type Obra } from '~/models/obra.server';

//just to trigger deploy!

export async function loader({ params, request }: LoaderArgs) {
  const { userToken, userId } = await getUserSession(request);
  const loggedInUser: Usuario = await getUsuario(userToken, userId);
  const loggedInUserObra: Obra['id'] = loggedInUser?.obra;
  const equipamentos = await getEquipamentos(userToken, 'created');
  const operadores = await getOperadores(userToken, 'created');
  const OSs = await getOSs(userToken, 'created');
  const operacoes = await getOperacoes(userToken, 'created');
  const boletins = await getBoletins(userToken, 'created');
  const newCode = genCodigo(boletins, 'BOL-');

  const filteredEquipamentos =
    loggedInUser.tipo_acesso === 'Encarregado'
      ? equipamentos.filter(
          (item: Equipamento) =>
            item.obra === loggedInUserObra &&
            item.encarregado === loggedInUser.id
        )
      : equipamentos;

  const sortedEquipamentos: Option[] = filteredEquipamentos
    ?.filter((item: Equipamento) => !item?.inativo)
    ?.map((item: Equipamento) => {
      const { id, codigo } = item;
      return {
        name: id,
        displayName: codigo,
      };
    })
    .sort((a: Option, b: Option) => a.displayName.localeCompare(b.displayName));

  const filteredOperadores =
    loggedInUser.tipo_acesso === 'Encarregado'
      ? operadores.filter(
          (item: Operador) =>
            item?.encarregado?.id === loggedInUser.id &&
            item?.obra?.id === loggedInUserObra
        )
      : operadores;

  const sortedOperadores: Option[] = filteredOperadores
    ?.filter((item: Equipamento) => !item?.inativo)
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

  const sortedOSs: Option[] = OSs?.map((item: OS) => {
    const { id, codigo } = item;
    return {
      name: id,
      displayName: codigo?.replace('OS-', ''),
    };
  })?.sort((a: Option, b: Option) =>
    a.displayName.localeCompare(b.displayName)
  );

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

  const commonProperties = {
    equipamentos,
    sortedEquipamentos,
    loggedInUser,
    operadores,
    sortedOperadores,
    OSs,
    sortedOSs,
    operacoes,
    sortedOperacoes,
  };

  if (params.id === 'new') {
    return json({
      ...commonProperties,
      newCode,
    });
  } else if (params.id?.startsWith('BOL-')) {
    const boletins = await getBoletins(userToken, 'created');
    const findBoletim = boletins?.find(
      (boletim: Boletim) => boletim.codigo === params.id
    )?.id;
    return redirect(`/boletim/${findBoletim}`);
  } else {
    const boletim = await getBoletim(userToken, params.id as string);
    return json({
      ...commonProperties,
      boletim,
    });
  }
}

export async function action({ params, request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

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

  const generateValidationSchema = () => {
    const schema: any = {};
    for (let i = 0; i < Number(formData.rows); i++) {
      schema[`OS_${i}`] = z.string().min(1, CAMPO_OBRIGATORIO);
      schema[`operacao_${i}`] = z.string().min(1, CAMPO_OBRIGATORIO);
      schema[`hora_inicio_${i}`] = z.string().min(1, CAMPO_OBRIGATORIO);
      schema[`hora_final_${i}`] = z.string().min(1, CAMPO_OBRIGATORIO);
      schema[`IM_inicio_${i}`] = z.string().min(1, CAMPO_OBRIGATORIO);
      schema[`IM_final_${i}`] = z.string().min(1, CAMPO_OBRIGATORIO);
    }
    return schema;
  };

  const validationSchema = z
    .object({
      data_boletim: z.string().min(1, CAMPO_OBRIGATORIO),
      equipamento: z.string().min(1, CAMPO_OBRIGATORIO),
      tipo_equipamento: z.string().min(1, CAMPO_OBRIGATORIO),
      operador: z.string().min(1, CAMPO_OBRIGATORIO),
      ...generateValidationSchema(),
    })
    .refine(
      (schema) => {
        for (let i = 0; i < Number(formData.rows); i++) {
          if (
            Number(schema[`IM_final_${i}`]) <=
              Number(schema[`IM_inicio_${i}`]) ||
            !isTimeGreater(
              schema[`hora_inicio_${i}`],
              schema[`hora_final_${i}`]
            )
          ) {
            return false;
          }
        }
        return true;
      },
      (schema) => ({
        message: JSON.stringify(schema),
      })
    );

  const validatedSchema = validationSchema.safeParse(formData);

  if (!validatedSchema.success) {
    const errors = validatedSchema.error.format();
    const dynamicErrors: any = {};

    for (let i = 0; i < Number(formData.rows); i++) {
      dynamicErrors[`OS_${i}`] = errors[`OS_${i}`]?._errors[0];
      dynamicErrors[`operacao_${i}`] = errors[`operacao_${i}`]?._errors[0];
      dynamicErrors[`hora_inicio_${i}`] =
        errors[`hora_inicio_${i}`]?._errors[0];
      dynamicErrors[`hora_final_${i}`] = errors[`hora_final_${i}`]?._errors[0];
      dynamicErrors[`IM_inicio_${i}`] = errors[`IM_inicio_${i}`]?._errors[0];
      dynamicErrors[`IM_final_${i}`] = errors[`IM_final_${i}`]?._errors[0];
    }

    return {
      errors: {
        ...dynamicErrors,
        data_boletim: errors.data_boletim?._errors[0],
        equipamento: errors.equipamento?._errors[0],
        tipo_equipamento: errors.tipo_equipamento?._errors[0],
        operador: errors.operador?._errors[0],
        invalidInput: errors?._errors[0],
        descricao_manutencao: errors?._errors[0],
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
      manutencao: formData?.manutencao === 'on' ? true : false,
      lubrificacao: formData?.lubrificacao === 'on' ? true : false,
      limpeza: formData?.limpeza === 'on' ? true : false,
      lastRowIMFinal: equipamento_logs[equipamento_logs?.length - 1]?.IM_final,
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
      manutencao: formData?.manutencao === 'on' ? true : false,
      lubrificacao: formData?.lubrificacao === 'on' ? true : false,
      limpeza: formData?.limpeza === 'on' ? true : false,
      lastRowIMFinal: equipamento_logs[equipamento_logs?.length - 1]?.IM_final,
    };

    const boletim = await _updateBoletim(
      userToken,
      params.id as string,
      body as Boletim
    );

    if (boletim.data) {
      return json({ error: boletim.data });
    }
    setToastMessage(session, 'Sucesso', 'Boletim editado!', 'success');
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
    loggedInUser,
    equipamentos,
    boletim,
    operacoes,
    sortedOperacoes,
    sortedEquipamentos,
    sortedOperadores,
    OSs,
    sortedOSs,
    newCode,
  } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  const [rows, setRows] = useState(boletim ? 0 : 1);
  const [equipamento, setEquipamento] = useState<any>();
  const [equipLogs, setEquipLogs] = useState<any>([]);
  const [currentLog, setCurrentLog] = useState<any>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [OS, setOS] = useState({});
  const [OP, setOP] = useState({});
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    if (boletim) {
      setRows(boletim.equipamento_logs.length);
      const findEquip = equipamentos.find(
        (item: Equipamento) => item.id === boletim.equipamento
      );
      setEquipamento(findEquip);
      const newEquipLogsMap = boletim?.equipamento_logs?.map((item) => {
        const IM_inicio = removeIMSuffix(item.IM_inicio);
        const IM_final = removeIMSuffix(item.IM_final);
        const isHoraValid = isTimeGreater(item.hora_inicio, item.hora_final);
        const isIMValid = Number(IM_inicio) <= Number(IM_final);

        return {
          ...item,
          IM_inicio,
          IM_final,
          isHoraValid,
          isIMValid,
          isRowValid: isHoraValid && isIMValid,
        };
      });
      setEquipLogs(newEquipLogsMap);
      setTimeout(() => {
        setIsFormValid(true);
        setShowSpinner(false);
      }, 1000);
    } else {
      setShowSpinner(false);
    }
  }, []);

  useEffect(() => {
    if (equipLogs.length > 0) {
      setIsFormValid(equipLogs.every((log) => log.isRowValid === true));
    }
  }, [equipLogs]);

  const handleSelectEquipamento = (option: Option) => {
    const equip = equipamentos.find(
      (equip: Equipamento) => equip.id === option.name
    );
    setEquipamento(equip);
    setEquipLogs((prevLogs: any) => {
      const firstLog = prevLogs.length > 0 ? { ...prevLogs[0] } : { index: 0 };
      firstLog.IM_inicio = equip?.instrumento_medicao_atual || '';
      return [firstLog, ...prevLogs.slice(1)];
    });
  };

  const handleChange = (
    name: string,
    value: Option | string,
    index: number
  ) => {
    if (name === 'OS') {
      const findOS = OSs.find((item: OS) => item?.id === value?.name);
      setOS(findOS);
    }
    if (name === 'OP') {
      const findOP = operacoes.find(
        (item: Operacao) => item?.id === value?.name
      );
      setOP(findOP);
    }
    const logToUpdate =
      equipLogs.find((log) => log.index === index) || currentLog;

    logToUpdate[name] = value;

    if (name === 'hora_inicio' || name === 'hora_final') {
      const { hora_inicio, hora_final } = logToUpdate;
      logToUpdate.isHoraValid =
        hora_inicio && hora_final && isTimeGreater(hora_inicio, hora_final);
    }

    if (name === 'IM_inicio' || name === 'IM_final') {
      const { IM_inicio, IM_final } = logToUpdate;
      logToUpdate.isIMValid = Number(IM_inicio) <= Number(IM_final);
    }

    logToUpdate.isRowValid = logToUpdate.isHoraValid && logToUpdate.isIMValid;

    setEquipLogs((prevLogs) => {
      const updatedLogs = [...prevLogs];
      const logIndex = updatedLogs.findIndex((log) => log.index === index);

      if (logIndex !== -1) {
        // Update the current row
        updatedLogs[logIndex] = logToUpdate;

        // Recompute validation flags for subsequent rows
        for (let i = logIndex + 1; i < updatedLogs.length; i++) {
          const currentLog = updatedLogs[i];
          const previousLog = updatedLogs[i - 1];

          currentLog.isHoraValid =
            currentLog.hora_inicio &&
            currentLog.hora_final &&
            isTimeGreater(currentLog.hora_inicio, currentLog.hora_final);

          // Update IM_inicio if previous row is valid
          if (previousLog.isRowValid) {
            currentLog.IM_inicio = previousLog.IM_final;
            currentLog.hora_inicio = previousLog.hora_final;
          }

          currentLog.isIMValid =
            currentLog.IM_inicio &&
            currentLog.IM_final &&
            Number(currentLog.IM_inicio) <= Number(currentLog.IM_final);

          currentLog.isRowValid =
            currentLog.isHoraValid && currentLog.isIMValid;
        }
      } else {
        updatedLogs.push(logToUpdate);
      }

      return updatedLogs;
    });
  };

  const handleAddRow = () => {
    if (rows < 13) {
      let isFormValid = true;

      for (let i = 0; i < equipLogs.length; i++) {
        const log = equipLogs[i];
        if ('isRowValid' in currentLog && log.isRowValid === false) {
          isFormValid = false;
          break;
        }
      }

      if (isFormValid) {
        const index = rows - 1;
        const findLog = equipLogs.find((log) => log.index === index);

        const newLog = {
          hora_inicio: findLog?.hora_final,
          IM_inicio: findLog?.IM_final,
          index: rows,
        };
        setEquipLogs((prevLogs: any) => [...prevLogs, newLog]);
        setRows(rows + 1);
      }

      setIsFormValid(false);
      setOS({});
      setOP({});
    }
  };

  const handleClickedRow = (index: number) => {
    const logToUpdate = equipLogs.find(
      (log: EquipamentoLog) => log.index === index
    );

    if (logToUpdate) {
      setCurrentLog(logToUpdate);
    } else {
      setCurrentLog({ index });
    }
  };

  return (
    <Modal
      size="xxl"
      title={`${boletim ? 'Editar' : 'Adicionar'} Boletim`}
      variant={boletim ? 'grey' : 'blue'}
      content={
        showSpinner ? (
          <div className="flex justify-center flex-col items-center gap-4 h-[500px]">
            <SpinnerIcon className="!h-12 !w-12" />
            <p>Carregando boletim...</p>
          </div>
        ) : (
          <div className="flex">
            <div className="pr-4 border-r-grey/40 border-r">
              <Row>
                <InputMask
                  mask="99/99/9999"
                  type="text"
                  name="data_boletim"
                  label="Data de início"
                  defaultValue={
                    boletim
                      ? convertISOToDate(boletim?.data_boletim)
                      : getCurrentDate()
                  }
                  className="!w-[132px]"
                  error={actionData?.errors?.data_boletim}
                />
                <Select
                  name="equipamento"
                  options={sortedEquipamentos}
                  label="Equipamento"
                  defaultValue={boletim?.equipamento}
                  placeholder="-"
                  error={actionData?.errors?.equipamento}
                  onChange={handleSelectEquipamento}
                  className="!w-[132px]"
                />
                <InputValue
                  type="text"
                  name="tipo_equipamento"
                  label="Descrição do equipamento"
                  className="!w-[280px]"
                  value={equipamento?.tipo_equipamentoX}
                  disabled
                  tabIndex={-1}
                  error={actionData?.errors?.tipo_equipamento}
                />
                <Select
                  name="operador"
                  options={sortedOperadores}
                  label="Operador"
                  defaultValue={boletim?.operador}
                  placeholder="-"
                  error={actionData?.errors?.operador}
                  className="!w-[280px]"
                />
              </Row>
              <input hidden name="obra" value={loggedInUser?.obra} />
              <input hidden name="encarregado" value={loggedInUser?.id} />
              <input hidden name="newCode" value={newCode} />
              <input hidden name="rows" value={rows} />
              <div className="mt-4 h-full scrollbar-thin scrollbar-thumb-grey/30 scrollbar-thumb-rounded pr-2">
                {Array.from(new Array(rows), (_, index) => {
                  return (
                    <Row key={index}>
                      <Select
                        name={`OS_${index}`}
                        options={sortedOSs}
                        labelBold
                        label="O.S."
                        defaultValue={equipLogs[index]?.OS}
                        placeholder="-"
                        error={actionData?.errors?.[`OS_${index}`]}
                        className="!w-[132px]"
                        noLabel={index !== 0}
                        onChange={(value) => handleChange('OS', value, index)}
                        onClick={() => handleClickedRow(index)}
                      />
                      <Select
                        name={`operacao_${index}`}
                        options={sortedOperacoes}
                        label="Operação"
                        labelBold
                        defaultValue={equipLogs[index]?.OP}
                        placeholder="-"
                        error={actionData?.errors?.[`operacao_${index}`]}
                        className="!w-[132px]"
                        noLabel={index !== 0}
                        onChange={(value) => handleChange('OP', value, index)}
                        onClick={() => handleClickedRow(index)}
                      />
                      <InputValue
                        type="time"
                        name={`hora_inicio_${index}`}
                        label="Hora Início"
                        labelBold
                        className="!w-[132px]"
                        value={equipLogs[index]?.hora_inicio}
                        error={actionData?.errors?.[`hora_inicio_${index}`]}
                        noLabel={index !== 0}
                        onChange={(value) =>
                          handleChange('hora_inicio', value, index)
                        }
                        onClick={() => handleClickedRow(index)}
                        disabled={index !== 0}
                      />
                      <InputValue
                        type="time"
                        name={`hora_final_${index}`}
                        label="Hora Final"
                        labelBold
                        className="!w-[132px]"
                        value={equipLogs[index]?.hora_final}
                        noLabel={index !== 0}
                        onChange={(value) =>
                          handleChange('hora_final', value, index)
                        }
                        onClick={() => handleClickedRow(index)}
                        error={
                          equipLogs[index]?.isHoraValid === false
                            ? 'Hora inválida!'
                            : '' || actionData?.errors?.[`hora_final_${index}`]
                        }
                      />
                      <InputValue
                        type="IM"
                        name={`IM_inicio_${index}`}
                        label={`${
                          equipamento?.instrumento_medicao
                            ? equipamento?.instrumento_medicao
                            : 'IM'
                        } Início`}
                        labelBold
                        className="!w-[130px]"
                        value={equipLogs[index]?.IM_inicio}
                        error={actionData?.errors?.[`IM_inicio_${index}`]}
                        noLabel={index !== 0}
                        onChange={(value) =>
                          handleChange('IM_inicio', value, index)
                        }
                        onClick={() => handleClickedRow(index)}
                        disabled
                      />
                      <InputValue
                        type="IM"
                        name={`IM_final_${index}`}
                        label={`${
                          equipamento?.instrumento_medicao
                            ? equipamento?.instrumento_medicao
                            : 'IM'
                        } Final`}
                        labelBold
                        className="!w-[130px]"
                        value={equipLogs[index]?.IM_final}
                        noLabel={index !== 0}
                        onChange={(value) =>
                          handleChange('IM_final', value, index)
                        }
                        onClick={() => handleClickedRow(index)}
                        error={
                          equipLogs[index]?.isIMValid === false
                            ? 'IM inválido!'
                            : '' || actionData?.errors?.[`IM_final_${index}`]
                        }
                      />
                    </Row>
                  );
                })}
                <TwoLinesInfo OS={OS} OP={OP} />

                {rows < 12 && (
                  <div className="w-full flex justify-center mt-2 mb-4">
                    <div
                      className={`${
                        isFormValid
                          ? 'hover:bg-white rounded-full cursor-pointer'
                          : 'cursor-default pointer-events-none'
                      }`}
                      onClick={handleAddRow}
                    >
                      <PlusCircleIcon
                        className={`${
                          isFormValid ? 'text-blue' : 'text-grey'
                        } h-8 w-8`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full pl-4">
              <Row>
                <InputValue
                  type="IM"
                  name="abastecimento_1"
                  label="Abast. 1"
                  value={boletim?.abastecimento_1}
                  suffix=" L"
                  className="!w-[114px]"
                />
                <InputValue
                  type="IM"
                  name="abastecimento_2"
                  label="Abast. 2"
                  value={boletim?.abastecimento_2}
                  suffix=" L"
                  className="!w-[114px]"
                />
              </Row>
              <Row className="!gap-3">
                <Checkbox
                  label="Manutenção"
                  name="manutencao"
                  value={boletim?.manutencao}
                  disabled={boletim?.manutencao}
                />
                <Checkbox
                  label="Lubrificação"
                  name="lubrificacao"
                  value={boletim?.lubrificacao}
                />
                <Checkbox
                  label="Limpeza"
                  name="limpeza"
                  value={boletim?.limpeza}
                />
              </Row>
              <Row className="mt-2">
                <Textarea
                  name="descricao_manutencao"
                  label="Descrição da Manutenção"
                  defaultValue={boletim?.descricao_manutencao}
                  error={actionData?.errors?.descricao_manutencao}
                />
              </Row>
            </div>
          </div>
        )
      }
      footerSummary={
        <FooterSummary
          loggedInUser={loggedInUser}
          equipamento={equipamento}
          firstHour={equipLogs[0]?.hora_inicio}
          lastHour={equipLogs[equipLogs.length - 1]?.hora_final}
          IMInicio={equipLogs[0]?.IM_inicio}
          IMFinal={equipLogs[equipLogs.length - 1]?.IM_final}
        />
      }
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
          disabled={!isFormValid}
        />
      }
    />
  );
}
