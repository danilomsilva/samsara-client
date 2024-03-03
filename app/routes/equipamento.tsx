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
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import Button from '~/components/Button';
import CustomErrorBoundary from '~/components/ErrorBoundary';
import LinkButton from '~/components/LinkButton';
import Modal from '~/components/Modal';
import Textarea from '~/components/Textarea';
import ServiceIcon from '~/components/icons/ServiceIcon';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import {
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
import { checkDateValid } from '~/utils/utils';
import ReadIcon from '~/components/icons/ReadIcon';
import FilterIcon from '~/components/icons/FilterIcon';
import ExportOptions from '~/components/ExportOptions';
import EquipamentoTable from '~/components/EquipamentoTable';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Equipamento | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken, tipoAcesso } = await getUserSession(request);
  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.get('sort');
  const filter = searchParams.get('filter');
  const page = searchParams.get('page' || '1');
  const perPage = searchParams.get('perPage' || '30');

  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn
      ? `${order === 'asc' ? '+' : '-'}${sortColumn}`
      : 'codigo';

  //encarregado do not have access to table usuarios
  if (userToken && tipoAcesso !== 'Encarregado') {
    const equipamentos = await getEquipamentos(
      userToken,
      sortingBy,
      filter as string,
      page as string,
      perPage as string
    );

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
      inativo: false,
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
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>(
    {}
  );
  const { equipamentos } = useLoaderData<typeof loader>();
  const { selectedRow } = useSelectRow() as UseSelectedRow;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    const timeout = setTimeout(() => {
      let newFilters = '';
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (key === 'created') {
          // check if length of value is 10
          if (value.length === 10 && checkDateValid(value)) {
            const [day, month, year] = value.split('/');
            const date = `${year}-${month}-${day}`;
            if (Date.parse(date)) {
              newFilters += `(${key}>'${date}')`;
            }
          }
        } else if (
          key === 'instrumento_medicao_inicio' ||
          key === 'instrumento_medicao_atual' ||
          key === 'proxima_revisao' ||
          key === 'revisao_status'
        ) {
          newFilters += `(${key}>='${value}')`;
        } else {
          newFilters += `(${key}~'${value}')`;
        }
      });
      const splitFilters = newFilters.split(')(');
      const joinedFilters = splitFilters.join(')&&(');
      if (joinedFilters) newSearchParams.set('filter', joinedFilters);
      navigate(`${location.pathname}?${newSearchParams.toString()}`);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [activeFilters]);

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

  const handleToggleFilters = () => {
    setFilterVisible(!isFilterVisible);
    if (isFilterVisible) {
      navigate('/equipamento');
    }
  };

  const selectedEquipamento = equipamentos.items.find(
    (eq) => eq?.id === selectedRow
  );

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Equipamentos</h1>
        <div className="flex gap-4">
          {selectedRow ? (
            <>
              <LinkButton
                to={`/manutencao?param=${selectedRow}`}
                variant="blue"
                icon={<ServiceIcon />}
              >
                Histórico de manutenção
              </LinkButton>
              <LinkButton
                to={`./${selectedRow}?read=true`}
                variant="green"
                icon={<ReadIcon />}
              >
                Visualizar
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
            <>
              <ExportOptions
                tableHeaders={[
                  { key: 'tipo_equipamentoX', label: 'Tipo Equipamento' },
                  { key: 'codigo', label: 'Código' },
                  { key: 'modelo', label: 'Modelo' },
                  { key: 'ano', label: 'Ano' },
                  { key: 'instrumento_medicao_inicio', label: 'IM Início' },
                  { key: 'instrumento_medicao_atual', label: 'IM Atual' },
                  { key: 'proxima_revisao', label: 'Próx. Revisão' },
                  { key: 'revisao_status', label: 'Restante' },
                  { key: 'encarregadoX', label: 'Encarregado' },
                  { key: 'obraX', label: 'Obra' },
                ]}
                data={equipamentos.items}
                filename="equipamento"
              />
              <Button
                variant={isFilterVisible ? 'blue' : 'outlined'}
                name="filters"
                icon={
                  <FilterIcon
                    className={`${
                      isFilterVisible ? 'text-white' : 'text-blue'
                    } h-4 w-4`}
                  />
                }
                onClick={handleToggleFilters}
              >
                Filtros
              </Button>
              <LinkButton to="./new" variant="blue" icon={<Add />}>
                Adicionar
              </LinkButton>
            </>
          )}
        </div>
      </div>
      <EquipamentoTable
        id="table-equipamento"
        rows={equipamentos.items}
        pagination={{
          page: equipamentos.page,
          perPage: equipamentos.perPage,
          totalItems: equipamentos.totalItems,
          totalPages: equipamentos.totalPages,
        }}
        isFilterVisible={isFilterVisible}
        setFilterVisible={setFilterVisible}
        setActiveFilters={setActiveFilters}
        activeFilters={activeFilters}
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
