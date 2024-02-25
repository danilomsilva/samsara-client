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
      : '-created';

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
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const { obras } = useLoaderData<typeof loader>();
  const { selectedRow } = useSelectRow() as UseSelectedRow;
  const navigate = useNavigate();

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
            <LinkButton to="./new" variant="blue" icon={<Add />}>
              Adicionar
            </LinkButton>
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
