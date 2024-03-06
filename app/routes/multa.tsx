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
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import Button from '~/components/Button';
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
import { checkDateValid } from '~/utils/utils';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import Textarea from '~/components/Textarea';
import ReadIcon from '~/components/icons/ReadIcon';
import ExportOptions from '~/components/ExportOptions';
import FilterIcon from '~/components/icons/FilterIcon';
import ManutencaoTable from '~/components/ManutencaoTable';
import { Multa, getMultas, updateMulta } from '~/models/multa.server';
import MultaTable from '~/components/MultaTable';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Multas | Samsara' }];
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

  //encarregado do not have access to table manutencao
  if (userToken && tipoAcesso !== 'Encarregado') {
    const multas = await getMultas(
      userToken,
      sortingBy,
      filter as string,
      page as string,
      perPage as string
    );
    return json({ multas });
  } else {
    throw json('Acesso proibido', { status: 403 });
  }
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  if (formData?._action === 'desativar') {
    await updateMulta(userToken, formData.multaId as string, {
      inativo: true,
      motivo: formData?.motivo as string,
    });

    setToastMessage(session, 'Sucesso', 'Multa desativada!', 'success');
    return redirect('/multa', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData?._action === 'ativar') {
    await updateMulta(userToken, formData.multaId as string, {
      inativo: false,
      motivo: '',
    });
    setToastMessage(session, 'Sucesso', 'Multa ativada!', 'success');
    return redirect('/multa', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function MultaPage() {
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>(
    {}
  );
  const { multas } = useLoaderData<typeof loader>();
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
        } else if (key === 'IM_atual') {
          newFilters += `(${key}>='${value}')`;
        } else {
          newFilters += `(${key}~'${value}')`;
        }
      });
      const splitFilters = newFilters.split(')(');
      const joinedFilters = splitFilters.join(')&&(');
      newSearchParams.set('filter', joinedFilters);
      navigate(`${location.pathname}?${newSearchParams.toString()}`);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [activeFilters]);

  const handleCloseModalDesativar = () => {
    navigate('/multa');
    setModalDesativarOpen(false);
  };

  const handleCloseModalAtivar = () => {
    navigate('/multa');
    setModalAtivarOpen(false);
  };

  const handleChangeMotivo = (value: string) => {
    setMotivo(value);
  };

  const handleToggleFilters = () => {
    setFilterVisible(!isFilterVisible);
    if (isFilterVisible) {
      navigate('/multa');
    }
  };

  const selectedMulta = multas?.items?.find(
    (multa: Multa) => multa.id === selectedRow
  );

  return (
    <>
      <div className="flex justify-between items-end">
        <div className="flex gap-2">
          <h1 className="font-semibold">Lista de Multas</h1>
        </div>
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
                text={selectedMulta?.inativo ? 'Ativar' : 'Desativar'}
                variant={selectedMulta?.inativo ? 'blue' : 'red'}
                icon={<MinusCircleIcon />}
                onClick={
                  selectedMulta?.inativo
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
                  { key: 'data_infracao', label: 'Data da Infração' },
                  { key: 'codigo_infracao', label: 'Código da Infração' },
                  { key: 'valor', label: 'Valor da Infração' },
                  { key: 'condutor', label: 'Condutor' },
                  { key: 'equipamento', label: 'Equipamento' },
                  { key: 'modelo_equipamento', label: 'Modelo do Equipamento' },
                ]}
                data={multas.items}
                filename="multa"
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
      <MultaTable
        id="table-multa"
        rows={multas.items}
        pagination={{
          page: multas.page,
          perPage: multas.perPage,
          totalItems: multas.totalItems,
          totalPages: multas.totalPages,
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
          title="Desativar Multa"
          handleCloseModal={handleCloseModalDesativar}
          variant="red"
          content={
            <>
              <p className="pl-1">{`Deseja desativar esta multa ?`}</p>
              <Textarea
                name="motivo-text-area"
                label="Motivo:"
                onChange={handleChangeMotivo}
              />
            </>
          }
          footerActions={
            <Form method="post">
              <input type="hidden" name="multaId" value={selectedRow || ''} />
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
          title="Ativar Multa"
          handleCloseModal={handleCloseModalAtivar}
          variant="red"
          content={`Deseja ativar esta multa ?`}
          footerActions={
            <Form method="post">
              <input type="hidden" name="multaId" value={selectedRow || ''} />
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
