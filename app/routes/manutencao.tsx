import {
  json,
  type V2_MetaFunction,
  type LoaderArgs,
  type ActionArgs,
  redirect,
} from '@remix-run/node';
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import Button from '~/components/Button';
import DataTable from '~/components/DataTable';
import CustomErrorBoundary from '~/components/ErrorBoundary';
import LinkButton from '~/components/LinkButton';
import Modal from '~/components/Modal';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import { type Equipamento, getEquipamentos } from '~/models/equipamento.server';
import {
  type Manutencao,
  getManutencoes,
  updateManutencao,
} from '~/models/manutencao.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { formatNumberWithDotDelimiter } from '~/utils/utils';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import FilterOptions from '~/components/FilterOptions';
import DropdownMenu from '~/components/DropdownMenu';
import Textarea from '~/components/Textarea';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Manutenção | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken, tipoAcesso } = await getUserSession(request);
  const searchParams = new URL(request.url).searchParams;
  const filter = searchParams.get('filter');
  const sortParam = searchParams.get('sort');
  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn ? `${order === 'asc' ? '+' : '-'}${sortColumn}` : null;

  //encarregado do not have access to table manutencao
  if (userToken && tipoAcesso !== 'Encarregado') {
    const manutencoes = await getManutencoes(
      userToken,
      sortingBy,
      filter as string
    );
    const equipamentos = await getEquipamentos(
      userToken,
      'created',
      filter as string
    );
    return json({ manutencoes, equipamentos });
  } else {
    throw json('Acesso proibido', { status: 403 });
  }
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  if (formData?._action === 'desativar') {
    await updateManutencao(userToken, formData.manutencaoId as string, {
      inativo: true,
      motivo: formData?.motivo as string,
    });
    setToastMessage(session, 'Sucesso', 'Manutenção desativada!', 'success');
    return redirect('/manutencao', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData?._action === 'ativar') {
    await updateManutencao(userToken, formData.manutencaoId as string, {
      inativo: false,
      motivo: '',
    });
    setToastMessage(session, 'Sucesso', 'Manutenção ativada!', 'success');
    return redirect('/manutencao', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function ManutencaoPage() {
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const {
    manutencoes,
    equipamentos,
  }: { manutencoes: Manutencao[]; equipamentos: Equipamento[] } =
    useLoaderData();
  const navigate = useNavigate();
  const { selectedRow, setSelectedRow } = useSelectRow() as UseSelectedRow;
  const [searchParams] = useSearchParams();
  const param = searchParams.get('param');
  const filter = searchParams.get('filter');

  console.log('>>>>>>>', selectedRow);

  useEffect(() => {
    setSelectedRow('');
  }, [param, filter, setSelectedRow]);

  const handleCloseModalDesativar = () => {
    navigate('/obra');
    setModalDesativarOpen(false);
  };

  const handleCloseModalAtivar = () => {
    navigate('/obra');
    setModalAtivarOpen(false);
  };

  const handleChangeMotivo = (value: string) => {
    setMotivo(value);
  };

  const formattedManutencoes: Manutencao[] = manutencoes.map((manutencao) => {
    const isHorimetro =
      equipamentos.find((equip) => equip.codigo === manutencao.equipamentoX)
        ?.instrumento_medicao === 'Horímetro';
    const suffix = isHorimetro ? ' h' : ' km';
    return {
      ...manutencao,
      IM_atual: `${formatNumberWithDotDelimiter(
        Number(manutencao.IM_atual)
      )} ${suffix}`,
    };
  });

  const selectedEquipamento = equipamentos?.find(
    (equip: Equipamento) => equip.id === selectedRow
  );

  const tableHeaders = [
    { key: 'created', label: 'Data de criação' },
    { key: 'boletim', label: 'Boletim' },
    { key: 'equipamentoX', label: 'Equipamento' },
    { key: 'IM_atual', label: 'Horím./Odôm.' },
    { key: 'tipo_manutencao', label: 'Tipo de Manutenção' },
    { key: 'feito_porX', label: 'Feito por' },
    { key: 'encarregadoX', label: 'Encarregado' },
  ];

  return (
    <>
      <div className="flex justify-between items-end">
        {/* TODO: fix left link and justify between */}
        {param && <Link to="/equipamento">Lista de Equipamentos</Link>}
        {param && '/'}
        <h1 className="font-semibold">
          {param
            ? `Histórico de Manutenções (${selectedEquipamento?.codigo} - ${selectedEquipamento?.tipo_equipamentoX})`
            : 'Lista de Manutenções'}
        </h1>
        {!selectedRow && (
          <div className="flex gap-2">
            <FilterOptions />
            <DropdownMenu
              tableHeaders={tableHeaders}
              data={equipamentos}
              filename="equipamento"
            />
          </div>
        )}
        <div className="flex gap-4">
          {selectedRow ? (
            <>
              <LinkButton
                to={`./${selectedRow}`}
                variant="grey"
                icon={<PencilIcon />}
              >
                Editar
              </LinkButton>
              <Button
                text={
                  selectedEquipamento && selectedEquipamento.inativo
                    ? 'Ativar'
                    : 'Desativar'
                }
                variant={
                  selectedEquipamento && selectedEquipamento.inativo
                    ? 'blue'
                    : 'red'
                }
                icon={<MinusCircleIcon />}
                onClick={
                  selectedEquipamento && selectedEquipamento.inativo
                    ? () => setModalAtivarOpen(true)
                    : () => setModalDesativarOpen(true)
                }
              />
            </>
          ) : (
            <LinkButton to="./new" variant="blue" icon={<Add />}>
              Adicionar
            </LinkButton>
          )}
        </div>
      </div>
      <DataTable
        id="table-obra"
        columns={tableHeaders}
        rows={formattedManutencoes}
        path="/manutencao"
        placeholder={
          filter
            ? 'Nenhuma manutenção iniciada no período selecionado!'
            : 'Nenhuma manutenção cadastrada.'
        }
      />
      <Outlet />

      {/* desativar modal */}
      {isModalDesativarOpen && (
        <Modal
          title="Desativar Equipamento"
          handleCloseModal={handleCloseModalDesativar}
          variant="red"
          content={
            <>
              <p className="pl-1">{`Deseja desativar o equipamento ${selectedEquipamento?.codigo} ?`}</p>
              <Textarea
                name="motivo-text-area"
                label="Motivo:"
                onChange={handleChangeMotivo}
              />
            </>
          }
          footerActions={
            <Form method="put">
              <input
                type="hidden"
                name="equipamentoId"
                value={selectedRow || ''}
              />
              <input type="hidden" name="motivo" value={motivo} />
              <Button
                name="_action"
                value="desativar"
                variant="red"
                text="Desativar"
                icon={<MinusCircleIcon />}
              />
            </Form>
          }
        />
      )}
      {/* ativar modal */}
      {isModalAtivarOpen && (
        <Modal
          title="Ativar Equipamento"
          handleCloseModal={handleCloseModalAtivar}
          variant="red"
          content={`Deseja ativar o equipamento ${selectedEquipamento?.codigo} ?`}
          footerActions={
            <Form method="post">
              <input
                type="hidden"
                name="equipamentoId"
                value={selectedRow || ''}
              />
              <Button
                name="_action"
                value="ativar"
                variant="red"
                text="Ativar"
                icon={<MinusCircleIcon />}
              />
            </Form>
          }
        />
      )}
    </>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}
