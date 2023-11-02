import {
  json,
  type V2_MetaFunction,
  type LoaderArgs,
  type ActionArgs,
  redirect,
} from '@remix-run/node';
import { Form, Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import { useState } from 'react';
import Button from '~/components/Button';
import DataTable from '~/components/DataTable';
import CustomErrorBoundary from '~/components/ErrorBoundary';
import LinkButton from '~/components/LinkButton';
import Modal from '~/components/Modal';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import { type Obra, deleteObra, getObras } from '~/models/obra.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { CSVLink } from 'react-csv';
import SheetIcon from '~/components/icons/SheetIcon';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Obra | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken, tipoAcesso } = await getUserSession(request);
  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.get('sort');
  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn ? `${order === 'asc' ? '+' : '-'}${sortColumn}` : null;

  //encarregado do not have access to table Obras
  if (userToken && tipoAcesso !== 'Encarregado') {
    const obras = await getObras(userToken, sortingBy);
    return json({ obras });
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
      const obra = await deleteObra(userToken, formData.obraId as string);
      if (obra.message && obra.message.includes('required relation')) {
        setToastMessage(
          session,
          'Erro',
          'Obra está vinculado à algum outro campo e não pode ser removido.',
          'error'
        );
        return redirect('/obra', {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        });
      }
    } catch (error) {}
    setToastMessage(session, 'Sucesso', 'Obra removida!', 'success');
    return redirect('/obra', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function ObrasPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { obras }: { obras: Obra[] } = useLoaderData();
  const { selectedRow } = useSelectRow() as UseSelectedRow;

  const navigate = useNavigate();

  const handleCloseModal = () => {
    navigate('/obra');
    setModalOpen(false);
  };

  const deletingObra = obras.find((obra) => obra?.id === selectedRow);

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Obras</h1>
        <div className="flex gap-4">
          <CSVLink
            data={obras}
            className="bg-green text-white flex gap-2 p-2 px-4 rounded-lg justify-center h-10 items-center font-semibold uppercase text-xs"
          >
            <p>Exportar CSV</p>
            <SheetIcon />
          </CSVLink>

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
            <LinkButton to="./new" variant="blue" icon={<Add />}>
              Adicionar
            </LinkButton>
          )}
        </div>
      </div>
      <DataTable
        columns={[
          { name: 'created', displayName: 'Data de criação' },
          { name: 'nome', displayName: 'Nome da obra' },
          { name: 'cidade', displayName: 'Cidade' },
          { name: 'data_inicio', displayName: 'Data de início' },
          { name: 'data_final_previsto', displayName: 'Data final prevista' },
        ]}
        rows={obras}
        path="/obra"
        placeholder="Nenhuma obra cadastrada."
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Remover Obra"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja excluir a obra ${deletingObra?.nome} ?`}
          footerActions={
            <Form method="post">
              <input type="hidden" name="obraId" value={selectedRow || ''} />
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
