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
import { type Obra, getObras, updateObra } from '~/models/obra.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import DropdownMenu from '~/components/DropdownMenu';

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

  if (formData?._action === 'desativar') {
    await updateObra(userToken, formData.obraId as string, { inativo: true });
    setToastMessage(session, 'Sucesso', 'Obra desativada!', 'success');
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

  const selectedObra = obras.find((obra) => obra?.id === selectedRow);

  const tableHeaders = [
    { key: 'created', label: 'Data de criação' },
    { key: 'nome', label: 'Nome da obra' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'data_inicio', label: 'Data de início' },
    { key: 'data_final_previsto', label: 'Data final prevista' },
  ];

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Obras</h1>
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
          <DropdownMenu
            tableHeaders={tableHeaders}
            data={obras}
            filename="obras"
          />
        </div>
      </div>
      <DataTable
        id="table-obra"
        columns={tableHeaders}
        rows={obras}
        path="/obra"
        placeholder="Nenhuma obra cadastrada."
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Desativar Obra"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja desativar a obra ${selectedObra?.nome} ?`}
          footerActions={
            <Form method="post">
              <input type="hidden" name="obraId" value={selectedRow || ''} />
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
