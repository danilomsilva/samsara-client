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
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import { getOperadores, updateOperador } from '~/models/operador.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import ReadIcon from '~/components/icons/ReadIcon';
import { checkDateValid } from '~/utils/utils';
import ExportOptions from '~/components/ExportOptions';
import FilterIcon from '~/components/icons/FilterIcon';
import OperadorTable from '~/components/OperadorTable';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Operador | Samsara' }];
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
      : '-created';

  //encarregado do not have access to table operadores
  if (userToken && tipoAcesso !== 'Encarregado') {
    const operadores = await getOperadores(
      userToken,
      sortingBy,
      filter as string,
      page as string,
      perPage as string
    );
    return json({ operadores });
  } else {
    throw json('Acesso proibido', { status: 403 });
  }
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  if (formData?._action === 'desativar') {
    await updateOperador(userToken, formData.operadorId as string, {
      inativo: true,
      motivo: formData?.motivo as string,
    });
    setToastMessage(session, 'Sucesso', 'Operador desativado!', 'success');
    return redirect('/operador', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  if (formData?._action === 'ativar') {
    await updateOperador(userToken, formData.operadorId as string, {
      inativo: false,
      motivo: '',
    });
    setToastMessage(session, 'Sucesso', 'Operador ativado!', 'success');
    return redirect('/operador', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function OperadorPage() {
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>(
    {}
  );
  const { operadores } = useLoaderData<typeof loader>();
  const { selectedRow } = useSelectRow() as UseSelectedRow;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    const timeout = setTimeout(() => {
      let newFilters = '';
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (
          key === 'created' ||
          key === 'data_inicio' ||
          key === 'data_final_previsto'
        ) {
          // check if length of value is 10
          if (value.length === 10 && checkDateValid(value)) {
            const [day, month, year] = value.split('/');
            const date = `${year}-${month}-${day}`;
            if (Date.parse(date)) {
              newFilters += `(${key}>'${date}')`;
            }
          }
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
    navigate('/operador');
    setModalDesativarOpen(false);
  };

  const handleCloseModalAtivar = () => {
    navigate('/operador');
    setModalAtivarOpen(false);
  };

  const handleChangeMotivo = (value: string) => {
    setMotivo(value);
  };

  const handleToggleFilters = () => {
    setFilterVisible(!isFilterVisible);
    if (isFilterVisible) {
      navigate('/operador');
    }
  };

  const selectedOperador = operadores.items.find(
    (operador) => operador?.id === selectedRow
  );

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Operadores</h1>
        <div className="flex gap-4">
          {selectedRow ? (
            <>
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
                text={selectedOperador?.inativo ? 'Ativar' : 'Desativar'}
                variant={selectedOperador?.inativo ? 'blue' : 'red'}
                icon={<MinusCircleIcon />}
                onClick={
                  selectedOperador?.inativo
                    ? () => setModalAtivarOpen(true)
                    : () => setModalDesativarOpen(true)
                }
              />
            </>
          ) : (
            <>
              <ExportOptions
                tableHeaders={[
                  { key: 'created', label: 'Data de criação' },
                  { key: 'codigo', label: 'Código' },
                  { key: 'nome_completo', label: 'Nome completo' },
                  { key: 'atividade', label: 'Atividade' },
                  { key: 'obraX', label: 'Alocado à obra' },
                  { key: 'encarregadoX', label: 'Encarregado' },
                ]}
                data={operadores.items}
                filename="operador"
              />
              <Button
                variant={isFilterVisible ? 'blue' : 'outlined'}
                name="filters"
                icon={
                  <FilterIcon
                    className={`${
                      isFilterVisible ? 'text-white' : 'text-orange'
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
      <OperadorTable
        id="table-operador"
        rows={operadores.items}
        pagination={{
          page: operadores.page,
          perPage: operadores.perPage,
          totalItems: operadores.totalItems,
          totalPages: operadores.totalPages,
        }}
        isFilterVisible={isFilterVisible}
        setFilterVisible={setFilterVisible}
        setActiveFilters={setActiveFilters}
        activeFilters={activeFilters}
      />
      <Outlet />

      {/* delete modal */}
      {isModalDesativarOpen && (
        <Modal
          title="Desativar Operador"
          handleCloseModal={handleCloseModalDesativar}
          variant="red"
          content={
            <>
              <p className="pl-1">{`Deseja desativar o operador ${selectedOperador?.nome_completo} ?`}</p>
              <Textarea
                name="motivo-text-area"
                label="Motivo:"
                onChange={handleChangeMotivo}
              />
            </>
          }
          footerActions={
            <Form method="post">
              <input
                type="hidden"
                name="operadorId"
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
          title="Ativar Operador"
          handleCloseModal={handleCloseModalAtivar}
          variant="red"
          content={`Deseja ativar o operador ${selectedOperador?.nome_completo} ?`}
          footerActions={
            <Form method="post">
              <input
                type="hidden"
                name="operadorId"
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
