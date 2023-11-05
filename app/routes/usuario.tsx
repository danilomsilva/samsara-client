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
import {
  type Usuario,
  getUsuarios,
  deleteUsuario,
} from '~/models/usuario.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Usuário | Samsara' }];
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
    const usuarios = await getUsuarios(userToken, sortingBy);
    return json({ usuarios });
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
      const usuario = await deleteUsuario(userToken, formData.userId as string);
      if (usuario.message && usuario.message.includes('required relation')) {
        setToastMessage(
          session,
          'Erro',
          'Usuário está vinculado à algum outro campo e não pode ser removido.',
          'error'
        );
        return redirect('/usuario', {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        });
      }
    } catch (error) {}
    setToastMessage(session, 'Sucesso', 'Usuário removido!', 'success');
    return redirect('/usuario', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function UsuarioPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { usuarios }: { usuarios: Usuario[] } = useLoaderData();
  const navigate = useNavigate();
  const { selectedRow } = useSelectRow() as UseSelectedRow;

  const handleCloseModal = () => {
    navigate('/usuario');
    setModalOpen(false);
  };

  const deletingUsuario = usuarios.find(
    (usuario) => usuario?.id === selectedRow
  );

  const formattedUsuario = usuarios.map((item) => ({
    ...item,
    tipo_acesso: item.tipo_acesso?.replaceAll('_', ' '),
  }));

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Usuários</h1>
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
          { key: 'created', label: 'Data de criação' },
          { key: 'codigo', label: 'Código' },
          { key: 'nome_completo', label: 'Nome completo' },
          { key: 'email', label: 'Email' },
          { key: 'tipo_acesso', label: 'Tipo de acesso' },
          { key: 'obraX', label: 'Alocado à obra' },
          // pocketbase do not allow to sort by indirect attributes such as expand.obra.nome
        ]}
        rows={formattedUsuario}
        path="/usuario"
        placeholder="Nenhum usuário cadastrado"
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Remover Usuário"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja excluir o usuário ${deletingUsuario?.nome_completo} ?`}
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
