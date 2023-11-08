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
import {
  getEquipamentos,
  type Equipamento,
  updateEquipamento,
} from '~/models/equipamento.server';
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
    .map((item: Equipamento) => {
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
    const boletim = await getBoletim(
      userToken,
      findBoletim ? findBoletim : (params.id as string)
    );
    return json({
      ...commonProperties,
      boletim,
    });
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
    };

    const boletim = await _createBoletim(userToken, body as Boletim);

    if (boletim.data) {
      return json({ error: boletim.data });
    }

    //IM_atual from equipamento will always be updated as the last value informed on boletim
    await updateEquipamento(
      userToken,
      formData?.equipamento as string,
      { instrumento_medicao_atual: formData?.IM_final } as Equipamento
    );

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
    loggedInUser,
    equipamentos,
    boletim,
    sortedOperacoes,
    sortedEquipamentos,
    sortedOperadores,
    OSs,
    sortedOSs,
    operacoes,
    newCode,
  } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';

  const [equipamento, setEquipamento] = useState<Equipamento>();
  const [currentLog, setCurrentLog] = useState<Partial<EquipamentoLog>>();
  const [firstHour, setFirstHour] = useState<string>();
  const [lastHour, setLastHour] = useState<string>();
  const [IMInicio, setIMInicio] = useState<string>();
  const [IMFinal, setIMFinal] = useState<string>();

  const [rows, setRows] = useState(
    boletim ? boletim?.equipamento_logs?.length : 1
  );
  const [errors, setErrors] = useState<string[]>([]);

  const isFormValid =
    currentLog?.OS &&
    currentLog?.OP &&
    currentLog?.hora_inicio &&
    currentLog?.hora_final &&
    currentLog?.IM_inicio &&
    currentLog?.IM_final &&
    currentLog?.isHoraValid &&
    currentLog?.isIMValid;

  //USE EFFECTS
  useEffect(() => {
    if (boletim) {
      //EQUIPAMENTO
      const findEquipamento = equipamentos?.find(
        (equip: Equipamento) => equip?.id === boletim?.equipamento
      );
      setEquipamento(findEquipamento);

      //LOG
      const firstLog = boletim?.equipamento_logs[0];
      const lastLog =
        boletim?.equipamento_logs[boletim?.equipamento_logs?.length - 1];
      setCurrentLog({ ...lastLog, isHoraValid: true, isIMValid: true });

      //HORA
      setFirstHour(firstLog?.hora_inicio);
      setLastHour(lastLog?.hora_final);
      //IM
      setIMInicio(firstLog?.IM_inicio);
      setIMFinal(lastLog?.IM_final);
    } else {
      //CREATE - NEW FORM ONLY 1 ROW so INDEX 0
      setCurrentLog({
        ...currentLog,
        isHoraValid: true,
        isIMValid: true,
        index: 0,
      });
    }
  }, []);

  useEffect(() => {
    if (actionData?.errors?.invalidInput) {
      const parsedJSON = JSON?.parse(actionData?.errors?.invalidInput);

      // Create a copy of the current errors array and an update flag
      let updatedErrors = [...errors];
      let updated = false;

      for (let i = 0; i < rows; i++) {
        const horaInicio = `hora_inicio_${i}`;
        const horaFinal = `hora_final_${i}`;
        const IMInicio = `IM_inicio_${i}`;
        const IMFinal = `IM_final_${i}`;

        if (!isTimeGreater(parsedJSON[horaInicio], parsedJSON[horaFinal])) {
          // Check if horaFinal is in the errors array and add it if not
          if (!updatedErrors.includes(horaFinal)) {
            updatedErrors.push(horaFinal);
            updated = true;
          }
        } else {
          // Check if horaFinal is in the errors array and remove it if present
          const index = updatedErrors.indexOf(horaFinal);
          if (index !== -1) {
            updatedErrors.splice(index, 1);
            updated = true;
          }
        }

        if (Number(parsedJSON[IMInicio]) > Number(parsedJSON[IMFinal])) {
          // Check if IMFinal is in the errors array and add it if not
          if (!updatedErrors.includes(IMFinal)) {
            updatedErrors.push(IMFinal);
            updated = true;
          }
        } else {
          // Check if IMFinal is in the errors array and remove it if present
          const index = updatedErrors.indexOf(IMFinal);
          if (index !== -1) {
            updatedErrors.splice(index, 1);
            updated = true;
          }
        }
      }

      // Update the errors state only if changes were made
      if (updated) {
        setErrors(updatedErrors);
      }
    }
  }, [actionData, errors, rows]);

  useEffect(() => {
    if (currentLog?.index === 0) {
      setFirstHour(currentLog?.hora_inicio);
    }
  }, [rows, currentLog?.hora_inicio]);

  useEffect(() => {
    if (rows - 1 === currentLog?.index) {
      setLastHour(currentLog?.hora_final);
    }
  }, [rows, currentLog?.hora_final]);

  useEffect(() => {
    if (currentLog?.index === 0) {
      setIMInicio(currentLog?.IM_inicio);
    }
  }, [rows, currentLog?.IM_inicio]);

  useEffect(() => {
    if (rows - 1 === currentLog?.index) {
      setIMFinal(currentLog?.IM_final);
    }
  }, [rows, currentLog?.IM_final]);

  const handleSelectEquipamento = (option: Option) => {
    const equip = equipamentos.find(
      (equip: Equipamento) => equip.id === option.name
    );
    setEquipamento(equip);
  };

  const handleChange = (
    value: Option | string,
    name: string,
    rowIndex?: number
  ) => {
    const newValue =
      typeof value !== 'string'
        ? name === 'OS'
          ? OSs?.find((OS: OS) => OS.id === value.name)
          : name === 'OP'
          ? operacoes?.find((operacao: Operacao) => operacao.id === value.name)
          : value
        : value;

    let newLog = {
      ...currentLog,
      index: rowIndex,
      [name]: newValue,
    };

    // Check if hora_final is greater than hora_inicio
    if (newLog.hora_inicio && newLog.hora_final) {
      newLog.isHoraValid = isTimeGreater(newLog.hora_inicio, newLog.hora_final);
    }

    // Check if IM_final is greater than IM_inicio
    if (newLog.IM_inicio && newLog.IM_final) {
      newLog.isIMValid = Number(newLog.IM_inicio) < Number(newLog.IM_final);
    }

    setCurrentLog(newLog);
  };

  const handleAddRow = () => {
    if (rows < 12) {
      setCurrentLog({ isHoraValid: true, isIMValid: true, index: rows });
      setRows(rows + 1);
    }
  };

  const handleClickField = (rowIndex: number) => {
    setCurrentLog({
      ...currentLog,
      ...boletim?.equipamento_logs?.find(
        (log: EquipamentoLog) => log.index === rowIndex
      ),
      isHoraValid: true,
      isIMValid: true,
    });
  };

  return (
    <Modal
      size="xxl"
      title={`${boletim ? 'Editar' : 'Adicionar'} Boletim`}
      variant={boletim ? 'grey' : 'blue'}
      content={
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
            <input hidden name="rows" value={rows} />
            <input hidden name="obra" value={loggedInUser?.obra} />
            <input hidden name="encarregado" value={loggedInUser?.id} />
            <input hidden name="newCode" value={newCode} />
            <input hidden name="IM_final" value={IMFinal} />
            <div className="mt-4 h-full scrollbar-thin scrollbar-thumb-grey/30 scrollbar-thumb-rounded pr-2">
              {Array.from(new Array(rows), (_, index) => {
                const log: EquipamentoLog = boletim?.equipamento_logs?.find(
                  (log: EquipamentoLog) => Number(log.index) === index
                );

                return (
                  <Row key={index}>
                    <Select
                      name={`OS_${index}`}
                      options={sortedOSs}
                      labelBold
                      label="O.S."
                      defaultValue={log?.OS}
                      placeholder="-"
                      error={actionData?.errors?.[`OS_${index}`]}
                      className="!w-[132px]"
                      noLabel={index !== 0}
                      onChange={(value) => handleChange(value, 'OS')}
                    />
                    <Select
                      name={`operacao_${index}`}
                      options={sortedOperacoes}
                      label="Operação"
                      labelBold
                      defaultValue={log?.OP}
                      placeholder="-"
                      error={actionData?.errors?.[`operacao_${index}`]}
                      className="!w-[132px]"
                      noLabel={index !== 0}
                      onChange={(value) => handleChange(value, 'OP')}
                    />
                    <InputValue
                      type="time"
                      name={`hora_inicio_${index}`}
                      label="Hora Início"
                      labelBold
                      className="!w-[132px]"
                      value={log?.hora_inicio}
                      error={actionData?.errors?.[`hora_inicio_${index}`]}
                      noLabel={index !== 0}
                      onChange={(value) =>
                        handleChange(value, 'hora_inicio', index)
                      }
                      onClick={() => handleClickField(index)}
                    />
                    <InputValue
                      type="time"
                      name={`hora_final_${index}`}
                      label="Hora Final"
                      labelBold
                      className="!w-[132px]"
                      value={log?.hora_final}
                      error={
                        actionData?.errors?.[`hora_final_${index}`] ||
                        errors.includes(`hora_final_${index}`)
                          ? 'Hora Inválida!'
                          : currentLog
                          ? (currentLog?.index === index &&
                              !currentLog?.isHoraValid &&
                              'Hora inválida!') ||
                            ''
                          : ''
                      }
                      noLabel={index !== 0}
                      onChange={(value) =>
                        handleChange(value, 'hora_final', index)
                      }
                      onClick={() => handleClickField(index)}
                    />
                    <InputValue
                      type="text"
                      name={`IM_inicio_${index}`}
                      label={`${
                        equipamento?.instrumento_medicao
                          ? equipamento?.instrumento_medicao
                          : 'IM'
                      } Início`}
                      labelBold
                      className="!w-[130px]"
                      value={log?.IM_inicio}
                      error={actionData?.errors?.[`IM_inicio_${index}`]}
                      noLabel={index !== 0}
                      onChange={(value) =>
                        handleChange(value, 'IM_inicio', index)
                      }
                      onClick={() => handleClickField(index)}
                    />
                    <InputValue
                      type="text"
                      name={`IM_final_${index}`}
                      label={`${
                        equipamento?.instrumento_medicao
                          ? equipamento?.instrumento_medicao
                          : 'IM'
                      } Final`}
                      labelBold
                      className="!w-[130px]"
                      value={log?.IM_final}
                      error={
                        actionData?.errors?.[`IM_final_${index}`] ||
                        errors?.includes(`IM_final_${index}`)
                          ? 'IM Inválido!'
                          : currentLog
                          ? (currentLog?.index === index &&
                              !currentLog?.isIMValid &&
                              'IM inválido!') ||
                            ''
                          : ''
                      }
                      noLabel={index !== 0}
                      onChange={(value) =>
                        handleChange(value, 'IM_final', index)
                      }
                      onClick={() => handleClickField(index)}
                    />
                  </Row>
                );
              })}

              <TwoLinesInfo OS={currentLog?.OS} OP={currentLog?.OP} />

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
              />
            </Row>
          </div>
        </div>
      }
      footerSummary={
        <FooterSummary
          loggedInUser={loggedInUser}
          equipamento={equipamento}
          firstHour={firstHour}
          lastHour={lastHour}
          IMInicio={IMInicio}
          IMFinal={IMFinal}
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
