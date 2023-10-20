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
  type Boletim,
  deleteBoletim,
  getBoletins,
} from '~/models/boletim.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Boletim | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.get('sort');
  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn ? `${order === 'asc' ? '+' : '-'}${sortColumn}` : null;

  if (userToken) {
    const boletins = await getBoletins(userToken, sortingBy);
    //TODO: find a way to have multiple logs in same field equipamento_logs
    return json({ boletins });
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
      const boletim = await deleteBoletim(userToken, formData.obraId as string);
      if (boletim.message && boletim.message.includes('required relation')) {
        setToastMessage(
          session,
          'Erro',
          'Boletim está vinculado à algum outro campo e não pode ser removido.',
          'error'
        );
        return redirect('/boletim', {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        });
      }
    } catch (error) {}
    setToastMessage(session, 'Sucesso', 'Boletim removido!', 'success');
    return redirect('/boletim', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function BoletinsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { boletins }: { boletins: Boletim[] } = useLoaderData();
  const { selectedRow } = useSelectRow() as UseSelectedRow;

  const navigate = useNavigate();

  const handleCloseModal = () => {
    navigate('/boletim');
    setModalOpen(false);
  };

  const deletingBoletim = boletins.find(
    (boletim) => boletim?.id === selectedRow
  );

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Boletins</h1>
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
            <LinkButton to="./new" variant="blue" icon={<Add />}>
              Adicionar
            </LinkButton>
          )}
        </div>
      </div>
      <DataTable
        columns={[
          { name: 'data_boletim', displayName: 'Data' },
          { name: 'codigo', displayName: 'Boletim' },
          { name: 'equipamentoX', displayName: 'Equipamento' },
          { name: 'obraX', displayName: 'Obra' },
          { name: 'IM_inicio', displayName: 'IM Início' },
          { name: 'IM_final', displayName: 'IM Final' },
          { name: 'total_abastecimento', displayName: 'Abastecimento' },
          { name: 'manutencao', displayName: 'Manutenção' },
          { name: 'operadorX', displayName: 'Operador' },
          { name: 'encarregadoX', displayName: 'Criado por' },
        ]}
        rows={boletins}
        path="/boletim"
        placeholder="Nenhum boletim cadastrado."
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Remover Boletim"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja excluir o boletim ${deletingBoletim?.codigo} ?`}
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
