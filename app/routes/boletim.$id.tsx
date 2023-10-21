import { type LoaderArgs, type ActionArgs, json } from '@remix-run/node';
import { useLoaderData, useNavigation } from '@remix-run/react';
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
import { type Option } from '~/utils/consts';
import { getSession, getUserSession } from '~/session.server';
import { getCurrentDate } from '~/utils/utils';
import { useEffect, useState } from 'react';
import Input from '~/components/Input';
import { type Operador, getOperadores } from '~/models/operador.server';
import { type OS, getOSs } from '~/models/ordem-servico.server';
import { type Operacao, getOperacoes } from '~/models/operacao.server';
import InfoCircleIcon from '~/components/icons/InfoCircleIcon';

export async function loader({ params, request }: LoaderArgs) {
  const { userToken, userId } = await getUserSession(request);
  const loggedInUser: Usuario = await getUsuario(userToken, userId);
  const equipamentos = await getEquipamentos(userToken, 'created');
  const operadores = await getOperadores(userToken, 'created');
  const OSs = await getOSs(userToken, 'created');
  const operacoes = await getOperacoes(userToken, 'created');

  if (params.id === 'new') {
    return json({ loggedInUser, equipamentos, operadores, OSs, operacoes });
  } else {
    return json({});
  }
}

export async function action({ params, request }: ActionArgs) {
  // const { userToken } = await getUserSession(request);
  // const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());
  console.log(formData);

  return json({});
}

export default function NewOperador() {
  const { loggedInUser, equipamentos, boletim, operadores, OSs, operacoes } =
    useLoaderData();
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
  const [equipamento, setEquipamento] = useState<Equipamento>(
    boletim?.tipo_equipamentoX
  );
  const [rows, setRows] = useState(1);

  useEffect(() => {
    if (selectedEquipamento) {
      setEquipamento(
        equipamentos.find(
          (equip: Equipamento) => equip.id === selectedEquipamento.name
        )
      );
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
    setRows(rows + 1);
    setOS(null);
    setOP(null);
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
                name="data_inicio"
                label="Data de início"
                defaultValue={getCurrentDate()}
                className="!w-[120px]"
              />
              <Select
                name="equipamento"
                options={sortedEquipamentos}
                label="Equipamento"
                defaultValue={boletim?.equipamento}
                placeholder="-"
                // error={actionData?.errors?.equipamento}
                onChange={setSelectedEquipamento}
                className="!w-[120px]"
              />
              <Input
                type="text"
                name="descricao_equipamento"
                label="Descrição do equipamento"
                className="!w-[280px]"
                defaultValue={equipamento?.tipo_equipamentoX}
                // error={}
                disabled
              />
              <Select
                name="operador"
                options={sortedOperadores}
                label="Operador"
                // defaultValue={}
                placeholder="-"
                // error={}
                className="!w-[280px]"
              />
            </Row>
            <div className="mt-4 max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-grey/30 scrollbar-thumb-rounded pr-2">
              {Array.from(new Array(rows), (_, index) => {
                return (
                  <Row key={index}>
                    <Select
                      name={`OS_${index}`}
                      options={sortedOSs}
                      labelBold
                      label="O.S."
                      // defaultValue={}
                      placeholder="-"
                      // error={}
                      className="!w-[120px]"
                      noLabel={index !== 0}
                      onChange={setSelectedOS}
                    />
                    <Select
                      name={`operacao_${index}`}
                      options={sortedOperacoes}
                      labelBold
                      label="Operação"
                      // defaultValue={}
                      placeholder="-"
                      // error={}
                      className="!w-[120px]"
                      noLabel={index !== 0}
                      onChange={setSelectedOP}
                    />
                    <Input
                      type="time"
                      name={`hora_inicio_${index}`}
                      label="Hora Início"
                      className="!w-[132px]"
                      defaultValue={equipamento?.tipo_equipamentoX}
                      // error={}
                      noLabel={index !== 0}
                    />
                    <Input
                      type="time"
                      name={`hora_final_${index}`}
                      label="Hora Final"
                      className="!w-[132px]"
                      defaultValue={equipamento?.tipo_equipamentoX}
                      // error={}
                      noLabel={index !== 0}
                    />
                    <Input
                      type="text"
                      name={`IM_inicio_${index}`}
                      label={`${
                        equipamento?.instrumento_medicao
                          ? equipamento?.instrumento_medicao
                          : 'IM'
                      } Início`}
                      className="!w-[130px]"
                      // defaultValue={}
                      // error={}
                      noLabel={index !== 0}
                    />
                    <Input
                      type="text"
                      name={`IM_final_${index}`}
                      label={`${
                        equipamento?.instrumento_medicao
                          ? equipamento?.instrumento_medicao
                          : 'IM'
                      } Final`}
                      className="!w-[130px]"
                      // defaultValue={}
                      // error={}
                      noLabel={index !== 0}
                    />
                  </Row>
                );
              })}

              <div className="p-2 flex items-center gap-2">
                {(OS || OP) && <InfoCircleIcon className="h-6 w-6" />}
                <div>
                  <p>{OS && `${OS?.codigo} - ${OS?.descricao}`}</p>
                  <p>{OP && `${OP?.codigo} - ${OP?.descricao}`}</p>
                </div>
              </div>

              <div className="w-full flex justify-center py-6">
                <div
                  className="hover:bg-white rounded-full cursor-pointer"
                  onClick={handleAddRow}
                >
                  <PlusCircleIcon className="text-blue" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full pl-4">test</div>
        </div>
      }
      footerSummary={
        <div className="flex gap-16">
          {/* <SummaryItemPair label="Obra" value={loggedInUser?.obraX} />
          <SummaryItemPair
            label="Encarregado"
            value={loggedInUser?.nome_completo}
          />
          <SummaryItemPair
            label={`${equipamento?.instrumento_medicao} Início`}
            value={`--- ${selectedIMSuffix}`}
          />
          <SummaryItemPair label="IM Final" value={`--- ${selectedIMSuffix}`} />
          <SummaryItemPair label="Total" value={` --- ${selectedIMSuffix}`} /> */}
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
        />
      }
    ></Modal>
  );
}

// const SummaryItemPair = ({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) => {
//   return (
//     <div>
//       <p>{label}</p>
//       <p className="font-bold leading-tight">{value}</p>
//     </div>
//   );
// };
