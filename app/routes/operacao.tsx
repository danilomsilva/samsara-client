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
import CustomErrorBoundary from '~/components/ErrorBoundary';
import LinkButton from '~/components/LinkButton';
import Modal from '~/components/Modal';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import { type Operacao, deleteOperacao, getOperacoes } from '~/models/operacao';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Operação | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken, tipoAcesso } = await getUserSession(request);
  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.get('sort');
  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn ? `${order === 'asc' ? '+' : '-'}${sortColumn}` : null;

  //encarregado do not have access to table usuarios
  if (userToken && tipoAcesso !== 'Encarregado') {
    const operacoes = await getOperacoes(userToken, sortingBy);
    return json({ operacoes });
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
      const operacao = await deleteOperacao(
        userToken,
        formData.userId as string
      );
      if (operacao.message && operacao.message.includes('required relation')) {
        setToastMessage(
          session,
          'Erro',
          'Operação está vinculado à algum outro campo e não pode ser removida.',
          'error'
        );
        return redirect('/operacao', {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        });
      }
    } catch (error) {}
    setToastMessage(session, 'Sucesso', 'Operação removida!', 'success');
    return redirect('/operacao', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function OperacaoPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { operacoes }: { operacoes: Operacao[] } = useLoaderData();
  const rowSelected = searchParams.get('selected');
  const navigate = useNavigate();

  const handleCloseModal = () => {
    navigate('/operacao');
    setModalOpen(false);
  };

  const deletingOperacao = operacoes.find((op) => op?.id === rowSelected);

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Operação</h1>
        <div className="flex gap-4">
          {rowSelected ? (
            <>
              <LinkButton
                to={`./${rowSelected}`}
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
          { name: 'codigo', displayName: 'Código' },
          { name: 'descricao', displayName: 'Descrição' },
        ]}
        rows={operacoes}
        path="/operacao"
        placeholder="Nenhuma Operação cadastrada"
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Remover Operação"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja excluir a ${deletingOperacao?.codigo} - ${deletingOperacao?.descricao} ?`}
          footerActions={
            <Form method="post">
              <input type="hidden" name="userId" value={rowSelected || ''} />
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
