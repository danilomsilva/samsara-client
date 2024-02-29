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
import ExportOptions from '~/components/ExportOptions';
import LinkButton from '~/components/LinkButton';
import Modal from '~/components/Modal';
import OSTable from '~/components/OSTable';
import FilterIcon from '~/components/icons/FilterIcon';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import { type OS, deleteOS, getOSs } from '~/models/ordem-servico.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { checkDateValid } from '~/utils/utils';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Ordem de Serviço | Samsara' }];
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
    const OSs = await getOSs(
      userToken,
      sortingBy,
      filter as string,
      page as string,
      perPage as string
    );
    return json({ OSs });
  } else {
    throw json('Acesso proibido', { status: 403 });
  }
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  if (formData?._action === 'delete') {
    try {
      const OS = await deleteOS(userToken, formData.userId as string);
      if (OS.message && OS.message.includes('required relation')) {
        setToastMessage(
          session,
          'Erro',
          'Ordem de Serviço está vinculado à algum outro campo e não pode ser removida.',
          'error'
        );
        return redirect('/ordem-servico', {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        });
      }
    } catch (error) {}
    setToastMessage(
      session,
      'Sucesso',
      'Ordem de Serviço removida!',
      'success'
    );
    return redirect('/ordem-servico', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function OSPage() {
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>(
    {}
  );
  const { OSs } = useLoaderData<typeof loader>();
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

  const handleCloseModal = () => {
    navigate('/ordem-servico');
    setModalOpen(false);
  };

  const handleToggleFilters = () => {
    setFilterVisible(!isFilterVisible);
  };

  const selectedOS = OSs.items.find((os) => os?.id === selectedRow);

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Ordem de Serviço</h1>
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
                text="Remover"
                variant="red"
                icon={<MinusCircleIcon />}
                onClick={() => setModalOpen(true)}
              />
            </>
          ) : (
            <>
              <ExportOptions
                tableHeaders={[
                  { key: 'created', label: 'Data de criação' },
                  { key: 'codigo', label: 'Código' },
                  { key: 'descricao', label: 'Descrição' },
                ]}
                data={OSs.items}
                filename="ordem-servico"
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
      <OSTable
        id="table-obra"
        rows={OSs.items}
        pagination={{
          page: OSs.page,
          perPage: OSs.perPage,
          totalItems: OSs.totalItems,
          totalPages: OSs.totalPages,
        }}
        isFilterVisible={isFilterVisible}
        setFilterVisible={setFilterVisible}
        setActiveFilters={setActiveFilters}
        activeFilters={activeFilters}
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Remover Ordem de Serviço"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja excluir a ${selectedOS?.codigo} - ${selectedOS?.descricao} ?`}
          footerActions={
            <Form method="post">
              <input type="hidden" name="userId" value={selectedRow || ''} />
              <Button
                name="_action"
                value="delete"
                variant="red"
                text="Remover"
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
