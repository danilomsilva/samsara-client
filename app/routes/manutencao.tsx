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
import CogIcon from '~/components/icons/CogIcon';

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
    if (filter === 'revisao') {
      const allManutencoes = await getManutencoes(userToken, sortingBy);
      const manutencoes = allManutencoes.filter(
        (item: Manutencao) => item.tipo_manutencao === 'Revisão'
      );

      const equipamentos = await getEquipamentos(userToken, 'created');
      return json({ manutencoes, equipamentos });
    } else {
      const manutencoes = await getManutencoes(userToken, sortingBy);
      const equipamentos = await getEquipamentos(userToken, 'created');
      return json({ manutencoes, equipamentos });
    }
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
    });
    setToastMessage(session, 'Sucesso', 'Manutenção desativada!', 'success');
    return redirect('/manutencao', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function ManutencaoPage() {
  const [isModalOpen, setModalOpen] = useState(false);
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

  useEffect(() => {
    setSelectedRow('');
  }, [param, filter, setSelectedRow]);

  const handleCloseModal = () => {
    navigate('/manutencao');
    setModalOpen(false);
  };

  const formattedManutencoes: Manutencao[] = manutencoes
    .map((manutencao) => {
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
    })
    .filter((manutecao) => !param || manutecao.equipamento === param);

  const equipamento = equipamentos?.find(
    (equip: Equipamento) => equip.id === param
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
        <div className="flex gap-2">
          {param && <Link to="/equipamento">Lista de Equipamentos</Link>}
          {param && '/'}
          <h1 className="font-semibold">
            {param
              ? `Histórico de Manutenções (${equipamento?.codigo} - ${equipamento?.tipo_equipamentoX})`
              : 'Lista de Manutenções'}
          </h1>
        </div>
        <div className="flex gap-4">
          <LinkButton
            to={`${
              filter === 'revisao'
                ? '/manutencao'
                : '/manutencao?filter=revisao'
            }`}
            variant="grey"
            icon={<CogIcon />}
          >
            {filter === 'revisao' ? 'Lista Completa' : 'Apenas Revisões'}
          </LinkButton>
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
                text="Desativar"
                variant="red"
                icon={<MinusCircleIcon />}
                onClick={() => setModalOpen(true)}
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
        columns={tableHeaders}
        rows={formattedManutencoes}
        path="/manutencao"
        placeholder="Nenhuma manutenção cadastrada."
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Desativar Manutenção"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja desativar esta manutenção ?`}
          footerActions={
            <Form method="post">
              <input
                type="hidden"
                name="manutencaoId"
                value={selectedRow || ''}
              />
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
    </>
  );
}

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}
