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
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import { getObras, updateObra } from '~/models/obra.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import Textarea from '~/components/Textarea';
import ReadIcon from '~/components/icons/ReadIcon';
import ObraTable from '~/components/ObraTable';
import FilterIcon from '~/components/icons/FilterIcon';
import { checkDateValid } from '~/utils/utils';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Obra | Samsara' }];
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
      : 'nome';

  //encarregado do not have access to table Obras
  if (userToken && tipoAcesso !== 'Encarregado') {
    const obras = await getObras(
      userToken,
      sortingBy,
      filter as string,
      page as string,
      perPage as string
    );
    return json({ obras });
  } else {
    throw json('Acesso proibido', { status: 403 });
  }
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  if (formData?._action === 'desativar') {
    await updateObra(userToken, formData.obraId as string, {
      inativo: true,
      motivo: formData?.motivo as string,
    });
    setToastMessage(session, 'Sucesso', 'Obra desativada!', 'success');
    return redirect('/obra', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData?._action === 'ativar') {
    await updateObra(userToken, formData.obraId as string, {
      inativo: false,
      motivo: '',
    });
    setToastMessage(session, 'Sucesso', 'Obra ativada!', 'success');
    return redirect('/obra', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function ObrasPage() {
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>(
    {}
  );
  const { obras } = useLoaderData<typeof loader>();
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
      newSearchParams.set('filter', joinedFilters);
      navigate(`${location.pathname}?${newSearchParams.toString()}`);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [activeFilters]);

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

  const handleToggleFilters = () => {
    setFilterVisible(!isFilterVisible);
  };

  const selectedObra = obras.items.find((obra) => obra?.id === selectedRow);

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Obras</h1>
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
                text={
                  selectedObra && selectedObra.inativo ? 'Ativar' : 'Desativar'
                }
                variant={selectedObra && selectedObra.inativo ? 'blue' : 'red'}
                icon={<MinusCircleIcon />}
                onClick={
                  selectedObra && selectedObra.inativo
                    ? () => setModalAtivarOpen(true)
                    : () => setModalDesativarOpen(true)
                }
              />
            </>
          ) : (
            <>
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
      <ObraTable
        id="table-obra"
        rows={obras.items}
        pagination={{
          page: obras.page,
          perPage: obras.perPage,
          totalItems: obras.totalItems,
          totalPages: obras.totalPages,
        }}
        path="/obra"
        isFilterVisible={isFilterVisible}
        setFilterVisible={setFilterVisible}
        setActiveFilters={setActiveFilters}
        activeFilters={activeFilters}
      />
      <Outlet />

      {/* desativar modal */}
      {isModalDesativarOpen && (
        <Modal
          title="Desativar Obra"
          handleCloseModal={handleCloseModalDesativar}
          variant="red"
          content={
            <>
              <p className="pl-1">{`Deseja desativar a obra ${selectedObra?.nome} ?`}</p>
              <Textarea
                name="motivo-text-area"
                label="Motivo:"
                onChange={handleChangeMotivo}
              />
            </>
          }
          footerActions={
            <Form method="put">
              <input type="hidden" name="obraId" value={selectedRow || ''} />
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
          title="Ativar Obra"
          handleCloseModal={handleCloseModalAtivar}
          variant="red"
          content={`Deseja ativar a obra ${selectedObra?.nome} ?`}
          footerActions={
            <Form method="post">
              <input type="hidden" name="obraId" value={selectedRow || ''} />
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
