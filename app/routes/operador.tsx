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
import {
  type Operador,
  getOperadores,
  updateOperador,
} from '~/models/operador.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Operador | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken, tipoAcesso } = await getUserSession(request);
  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.get('sort');
  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn ? `${order === 'asc' ? '+' : '-'}${sortColumn}` : null;

  //encarregado do not have access to table operadores
  if (userToken && tipoAcesso !== 'Encarregado') {
    const operadores = await getOperadores(userToken, sortingBy);
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
    });
    setToastMessage(session, 'Sucesso', 'Operador desativado!', 'success');
    return redirect('/operador', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function OperadorPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { operadores }: { operadores: Operador[] } = useLoaderData();
  const navigate = useNavigate();
  const { selectedRow } = useSelectRow() as UseSelectedRow;

  const handleCloseModal = () => {
    navigate('/operador');
    setModalOpen(false);
  };

  const selectedOperador = operadores.find(
    (operador) => operador?.id === selectedRow
  );

  const tableHeaders = [
    { key: 'created', label: 'Data de criação' },
    { key: 'codigo', label: 'Código' },
    { key: 'nome_completo', label: 'Nome completo' },
    { key: 'atividade', label: 'Atividade' },
    { key: 'obraX', label: 'Alocado à obra' },
    { key: 'encarregadoX', label: 'Encarregado' },
  ];

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Operadores</h1>
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
        </div>
      </div>
      <DataTable
        columns={tableHeaders}
        rows={operadores}
        path="/operador"
        placeholder="Nenhum operador cadastrado."
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Desativar Operador"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja desativar o operador ${selectedOperador?.nome_completo} ?`}
          footerActions={
            <Form method="post">
              <input
                type="hidden"
                name="operadorId"
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
