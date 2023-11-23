import {
  json,
  type V2_MetaFunction,
  type LoaderArgs,
  type ActionArgs,
  redirect,
} from '@remix-run/node';
import {
  Form,
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { useState } from 'react';
import Button from '~/components/Button';
import DataTable from '~/components/DataTable';
import DropdownMenu from '~/components/DropdownMenu';
import CustomErrorBoundary from '~/components/ErrorBoundary';
import FilterOptions from '~/components/FilterOptions';
import LinkButton from '~/components/LinkButton';
import Modal from '~/components/Modal';
import Textarea from '~/components/Textarea';
import ListIcon from '~/components/icons/ListIcon';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import {
  type Equipamento,
  getEquipamentos,
  updateEquipamento,
} from '~/models/equipamento.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { formatCurrency, formatNumberWithDotDelimiter } from '~/utils/utils';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Equipamento | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken, tipoAcesso } = await getUserSession(request);
  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.get('sort');
  const filter = searchParams.get('filter');
  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn ? `${order === 'asc' ? '+' : '-'}${sortColumn}` : null;

  //encarregado do not have access to table usuarios
  if (userToken && tipoAcesso !== 'Encarregado') {
    const allEquipamentos = await getEquipamentos(
      userToken,
      sortingBy,
      filter as string
    );
    const equipamentos: Equipamento[] = allEquipamentos.map((item) => {
      const isHorimetro = item.instrumento_medicao === ('Horímetro' as string);
      const suffix = isHorimetro ? ' h' : ' Km';

      return {
        ...item,
        combustivel: item.combustivel?.replaceAll('_', ' '),
        valor_locacao: formatCurrency(Number(item.valor_locacao)), //TODO: possibly wrong!!
        instrumento_medicao_inicio: `${
          item.instrumento_medicao_inicio &&
          formatNumberWithDotDelimiter(Number(item.instrumento_medicao_inicio))
        } ${suffix}`,
        instrumento_medicao_atual: `${
          item.instrumento_medicao_atual &&
          formatNumberWithDotDelimiter(Number(item.instrumento_medicao_atual))
        } ${suffix}`,
        frequencia_revisao: `${
          item.frequencia_revisao &&
          formatNumberWithDotDelimiter(Number(item.frequencia_revisao))
        } ${suffix}`,
        proxima_revisao: `${
          item.proxima_revisao &&
          formatNumberWithDotDelimiter(Number(item.proxima_revisao))
        } ${suffix}`,
      };
    });
    return json({ equipamentos });
  } else {
    throw json('Acesso proibido', { status: 403 });
  }
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  if (formData?._action === 'desativar') {
    await updateEquipamento(userToken, formData.equipamentoId as string, {
      inativo: true,
      motivo: formData?.motivo as string,
    });
    setToastMessage(session, 'Sucesso', 'Equipamento desativado!', 'success');
    return redirect('/equipamento', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  if (formData?._action === 'ativar') {
    await updateEquipamento(userToken, formData.equipamentoId as string, {
      inativo: true,
      motivo: '',
    });
    setToastMessage(session, 'Sucesso', 'Equipamento ativado!', 'success');
    return redirect('/equipamento', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function EquipamentoPage() {
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const { equipamentos }: { equipamentos: Equipamento[] } = useLoaderData();
  const { selectedRow } = useSelectRow() as UseSelectedRow;
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const navigate = useNavigate();

  const handleCloseModalDesativar = () => {
    navigate('/equipamento');
    setModalDesativarOpen(false);
  };

  const handleCloseModalAtivar = () => {
    navigate('/equipamento');
    setModalAtivarOpen(false);
  };

  const handleChangeMotivo = (value: string) => {
    setMotivo(value);
  };

  const selectedEquipamento = equipamentos.find((eq) => eq?.id === selectedRow);

  const tableHeaders = [
    { key: 'created', label: 'Data de criação' },
    { key: 'codigo', label: 'Código' },
    { key: 'obraX', label: 'Alocado à obra' },
    { key: 'ano', label: 'Ano' },
    { key: 'combustivel', label: 'Combustível' },
    { key: 'instrumento_medicao', label: 'Tipo IM' },
    { key: 'encarregadoX', label: 'Encarregado' },
    { key: 'instrumento_medicao_inicio', label: 'IM Início' },
    { key: 'instrumento_medicao_atual', label: 'IM Atual' },
    { key: 'frequencia_revisao', label: 'Revisão' },
    { key: 'proxima_revisao', label: 'Próx. Revisão' },
    { key: 'revisao_status', label: 'Revisão' },
  ];

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Equipamentos</h1>
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
                to={`/manutencao?param=${selectedRow}`}
                variant="blue"
                icon={<ListIcon />}
              >
                Histórico de manutenção
              </LinkButton>
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
        id="table-equipamento"
        columns={tableHeaders}
        rows={equipamentos}
        path="/equipamento"
        placeholder={
          filter
            ? 'Nenhum equipamento cadastrado no período selecionado!'
            : 'Nenhum equipamento cadastrado.'
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
