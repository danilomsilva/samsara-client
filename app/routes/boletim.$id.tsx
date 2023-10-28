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
import ErrorMessage from '~/components/ErrorMessage';
import InputValue from '~/components/InputValue';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken, userId } = await getUserSession(request);
  const loggedInUser: Usuario = await getUsuario(userToken, userId);
  const equipamentos = await getEquipamentos(userToken, 'created');
  const operadores = await getOperadores(userToken, 'created');
  const OSs = await getOSs(userToken, 'created');
  const operacoes = await getOperacoes(userToken, 'created');
  const boletins = await getBoletins(userToken, 'created');
  const newCode = genCodigo(boletins, 'BOL-');

  if (params.id === 'new') {
    return json({
      loggedInUser,
      equipamentos,
      operadores,
      OSs,
      operacoes,
      newCode,
    });
  } else {
    const boletim = await getBoletim(userToken, params.id as string);
    return json({
      boletim,
      equipamentos,
      loggedInUser,
      operadores,
      OSs,
      operacoes,
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

  const validationSchema = z.object({
    data_boletim: z.string().min(1, CAMPO_OBRIGATORIO),
    equipamento: z.string().min(1, CAMPO_OBRIGATORIO),
    descricao_equipamento: z.string().min(1, CAMPO_OBRIGATORIO),
    operador: z.string().min(1, CAMPO_OBRIGATORIO),
    ...generateValidationSchema(),
  });

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
        data_boletim: errors.data_boletim?._errors[0], // create function to simplify this lines
        equipamento: errors.equipamento?._errors[0],
        descricao_equipamento: errors.descricao_equipamento?._errors[0],
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
    loggedInUser,
    equipamentos,
    boletim,
    operadores,
    OSs,
    operacoes,
    newCode,
  } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === 'submitting' || navigation.state === 'loading';
  const [selectedEquipamento, setSelectedEquipamento] = useState<Option | null>(
    null
  );
  const [selectedOS, setSelectedOS] = useState<Option | null>(null);
  const [OS, setOS] = useState<OS | null>(null);
  const [selectedOP, setSelectedOP] = useState<Option | null>(null);
  const [OP, setOP] = useState<OS | null>(null);
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [horaInicio, setHoraInicio] = useState<string | null>(null);
  const [horaFinal, setHoraFinal] = useState<string | null>(null);
  const [isHoraValid, setIsHoraValid] = useState<boolean | undefined>(
    undefined
  );
  const [IMInicio0, setIMInicio0] = useState<string | null>(null);
  const [IMInicio, setIMInicio] = useState<string | null>(null);
  const [IMFinal, setIMFinal] = useState<string | null>(null);
  const [isIMValid, setIsIMValid] = useState<boolean | undefined>(undefined);
  const [actionDataErrors, setActionDataErrors] = useState<{
    errors: { [key: string]: string };
  } | null>(null);

  const [rows, setRows] = useState(
    boletim ? boletim?.equipamento_logs?.length : 1
  );
  const [logs, setLogs] = useState<
    {
      OS: OS | null;
      OP: Operacao | null;
      horaInicio: string | null;
      horaFinal: string | null;
      IMInicio: string | null;
      IMFinal: string | null;
    }[]
  >([]);

  useEffect(() => {
    setActionDataErrors(null);
  }, [OS, OP, equipamento, horaInicio, horaFinal, IMInicio, IMFinal]);

  useEffect(() => {
    setActionDataErrors(actionData);
  }, [actionData]);

  useEffect(() => {
    if (IMInicio && IMFinal) {
      setIsIMValid(Number(IMFinal) >= Number(IMInicio));
    }
  }, [IMInicio, IMFinal]);

  useEffect(() => {
    if (horaInicio && horaFinal) {
      setIsHoraValid(isTimeGreater(String(horaInicio), String(horaFinal)));
    }
  }, [horaInicio, horaFinal]);

  useEffect(() => {
    setEquipamento(
      equipamentos.find(
        (equip: Equipamento) => equip.id === boletim?.equipamento
      )
    );

    if (boletim) {
      setIsHoraValid(true);
      setIsIMValid(true);
      setLogs(boletim.equipamento_logs);
      setIMInicio(
        boletim.equipamento_logs[boletim.equipamento_logs.length - 1]?.IM_inicio
      );
    }
  }, []);

  useEffect(() => {
    if (selectedEquipamento) {
      const equip = equipamentos.find(
        (equip: Equipamento) => equip.id === selectedEquipamento.name
      );
      setEquipamento(equip);
      setIMInicio0(equip.instrumento_medicao_inicio);
      setIMInicio(equip.instrumento_medicao_inicio);
    }
  }, [selectedEquipamento]);

  useEffect(() => {
    if (selectedOS) {
      setOS(OSs.find((OS: Equipamento) => OS.id === selectedOS.name));
    }
  }, [selectedOS]);

  useEffect(() => {
    if (selectedOP) {
      setOP(operacoes.find((op: Operacao) => op.id === selectedOP.name));
    }
  }, [selectedOP]);

  useEffect(() => {
    setHoraInicio(null);
    setHoraFinal(null);
    setIsHoraValid(undefined);
    const IMValue =
      rows > boletim?.equipamento_logs?.length ? 'IM_final' : 'IM_inicio';
    setIMInicio(
      boletim?.equipamento_logs[boletim?.equipamento_logs.length - 1][IMValue]
    );
    setIMFinal(null);
    setIsIMValid(undefined);
    setOS(null);
    setOP(null);
  }, [rows]);

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

  const handleAddRow = () => {
    if (rows < 12) {
      setLogs((prev) => [
        ...prev,
        {
          OS,
          OP,
          horaInicio,
          horaFinal,
          IMInicio,
          IMFinal,
        },
      ]);
      setRows(rows + 1);
    }
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
                error={actionDataErrors?.errors?.data_boletim}
              />
              <Select
                name="equipamento"
                options={sortedEquipamentos}
                label="Equipamento"
                defaultValue={boletim?.equipamento}
                placeholder="-"
                error={actionDataErrors?.errors?.equipamento}
                onChange={setSelectedEquipamento}
                className="!w-[132px]"
              />
              <Input
                type="text"
                name="descricao_equipamento"
                label="Descrição do equipamento"
                className="!w-[280px]"
                defaultValue={equipamento?.tipo_equipamentoX}
                disabled
                tabIndex={-1}
              />
              <Select
                name="operador"
                options={sortedOperadores}
                label="Operador"
                defaultValue={boletim?.operador}
                placeholder="-"
                error={actionDataErrors?.errors?.operador}
                className="!w-[280px]"
              />
            </Row>
            <input type="hidden" name="rows" value={rows} />
            <input type="hidden" name="obra" value={loggedInUser?.obra} />
            <input type="hidden" name="encarregado" value={loggedInUser?.id} />
            <input type="hidden" name="newCode" value={newCode} />
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
                      error={actionDataErrors?.errors?.[`OS_${index}`]}
                      className="!w-[132px]"
                      noLabel={index !== 0}
                      onChange={setSelectedOS}
                      disabled={index + 1 !== rows}
                    />
                    <Select
                      name={`operacao_${index}`}
                      options={sortedOperacoes}
                      label="Operação"
                      labelBold
                      defaultValue={log?.OP}
                      placeholder="-"
                      error={actionDataErrors?.errors?.[`operacao_${index}`]}
                      className="!w-[132px]"
                      noLabel={index !== 0}
                      onChange={setSelectedOP}
                      disabled={index + 1 !== rows}
                    />
                    <Input
                      type="time"
                      name={`hora_inicio_${index}`}
                      label="Hora Início"
                      labelBold
                      className="!w-[132px]"
                      defaultValue={log?.hora_inicio}
                      error={actionDataErrors?.errors?.[`hora_inicio_${index}`]}
                      noLabel={index !== 0}
                      onChange={setHoraInicio}
                      disabled={index + 1 !== rows}
                      readOnly={index + 1 !== rows}
                    />
                    <Input
                      type="time"
                      name={`hora_final_${index}`}
                      label="Hora Final"
                      labelBold
                      className="!w-[132px]"
                      defaultValue={log?.hora_final}
                      error={
                        actionDataErrors
                          ? actionData?.errors?.[`hora_final_${index}`]
                          : index + 1 === rows
                          ? horaFinal && !isHoraValid
                            ? 'Hora inválida!'
                            : undefined
                          : undefined
                      }
                      noLabel={index !== 0}
                      onChange={setHoraFinal}
                      disabled={index + 1 !== rows}
                      readOnly={index + 1 !== rows}
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
                      value={
                        boletim
                          ? index === rows - 1
                            ? IMInicio
                            : log?.IM_inicio
                          : index === 0
                          ? IMInicio0
                          : logs[index]
                          ? logs[index]?.IM_inicio
                          : logs[index - 1]?.IM_final // TODO: add IM to types aliases AND when creating make sure the final value from prev row will be copied to inicio value new row
                      }
                      error={actionDataErrors?.errors?.[`IM_inicio_${index}`]}
                      noLabel={index !== 0}
                      onChange={setIMInicio}
                      disabled={index + 1 !== rows || index === 0}
                      tabIndex={index === 0 ? -1 : 0}
                    />
                    <Input
                      type="text"
                      name={`IM_final_${index}`}
                      label={`${
                        equipamento?.instrumento_medicao
                          ? equipamento?.instrumento_medicao
                          : 'IM'
                      } Final`}
                      labelBold
                      className="!w-[130px]"
                      defaultValue={log?.IM_final}
                      error={
                        actionDataErrors
                          ? actionDataErrors?.errors?.[`IM_final_${index}`]
                          : index + 1 === rows &&
                            Number(IMFinal) > 0 &&
                            Number(IMInicio) > Number(IMFinal)
                          ? 'Valor inválido!'
                          : undefined
                      }
                      noLabel={index !== 0}
                      onChange={setIMFinal}
                      disabled={index + 1 !== rows}
                    />
                    {index + 1 !== rows && (
                      <div
                        className="bg-white rounded-full h-8 w-8 flex items-center justify-center hover:shadow-md cursor-pointer self-end mb-1"
                        onClick={() => console.log(index + 1)}
                      >
                        <PencilIcon />
                      </div>
                    )}
                  </Row>
                );
              })}

              <div className="p-2 flex flex-col gap-2 mt-3 text-sm h-16">
                {actionDataErrors?.errors?.invalidInput && (
                  <ErrorMessage
                    error={actionDataErrors?.errors?.invalidInput}
                  />
                )}
                <div className="flex gap-2 ">
                  {(OS || OP) && (
                    <InfoCircleIcon className="h-6 w-6 text-orange" />
                  )}
                  <div>
                    <p>
                      {OS && (
                        <>
                          <span className="font-bold">{OS?.codigo}</span>
                          <span> - </span>
                          <span>{OS?.descricao}</span>
                        </>
                      )}
                    </p>
                    <p>
                      {OP && (
                        <>
                          <span className="font-bold">{OP?.codigo}</span>
                          <span> - </span>
                          <span>{OP?.descricao}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {rows < 12 && (
                <div className="w-full flex justify-center">
                  <div
                    className={`${
                      boletim
                        ? 'hover:bg-white rounded-full cursor-pointer'
                        : !isHoraValid || !isIMValid
                        ? 'rounded-full cursor-default pointer-events-none'
                        : 'hover:bg-white rounded-full cursor-pointer'
                    }`}
                    onClick={handleAddRow}
                  >
                    <PlusCircleIcon
                      className={`${
                        boletim
                          ? 'text-blue'
                          : !isHoraValid || !isIMValid
                          ? 'text-grey'
                          : 'text-blue'
                      } h-8 w-8`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full pl-4">test</div>
        </div>
      }
      footerSummary={
        <div className="flex gap-16 -mt-1">
          <PairLabelValue label="Obra" value={loggedInUser?.obraX} />
          <PairLabelValue
            label="Encarregado"
            value={loggedInUser?.nome_completo}
          />
          <PairLabelValue
            label={`${
              equipamento?.instrumento_medicao
                ? equipamento?.instrumento_medicao
                : 'IM'
            } Início`}
            value={IMInicio0 ?? '-'}
          />
          <PairLabelValue
            label={`${
              equipamento?.instrumento_medicao
                ? equipamento?.instrumento_medicao
                : 'IM'
            } Final`}
            value={IMFinal ?? '-'}
          />
          <PairLabelValue
            label="Total"
            value={
              IMInicio0 && IMFinal
                ? +IMFinal - +IMInicio0 > 0
                  ? String(+IMFinal - +IMInicio0)
                  : '-'
                : '-'
            }
          />
        </div>
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
          disabled={boletim ? false : !isIMValid || !isHoraValid}
        />
      }
    />
  );
}
