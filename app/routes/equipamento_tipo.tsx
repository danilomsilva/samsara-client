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
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import Textarea from '~/components/Textarea';
import {
  type EquipamentoTipo,
  getEquipamentoTipos,
  updateEquipamentoTipo,
} from '~/models/equipamento_tipo.server';

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

  //encarregado do not have access to table equipamentoTipos
  if (userToken && tipoAcesso !== 'Encarregado') {
    const equipamentoTipos = await getEquipamentoTipos(userToken, sortingBy);
    return json({ equipamentoTipos });
  } else {
    throw json('Acesso proibido', { status: 403 });
  }
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  if (formData?._action === 'desativar') {
    await updateEquipamentoTipo(userToken, formData.obraId as string, {
      inativo: true,
      motivo: formData?.motivo as string,
    });
    setToastMessage(
      session,
      'Sucesso',
      'Tipo de equipamento desativado!',
      'success'
    );
    return redirect('/equipamento_tipo', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData?._action === 'ativar') {
    await updateEquipamentoTipo(userToken, formData.obraId as string, {
      inativo: false,
      motivo: '',
    });
    setToastMessage(
      session,
      'Sucesso',
      'Tipo de equipamento ativado!',
      'success'
    );
    return redirect('/equipamento_tipo', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function EquipamentoTipo() {
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const { equipamentoTipos }: { equipamentoTipos: EquipamentoTipo[] } =
    useLoaderData();
  const { selectedRow } = useSelectRow() as UseSelectedRow;
  const navigate = useNavigate();

  const handleCloseModalDesativar = () => {
    navigate('/equipamento_tipo');
    setModalDesativarOpen(false);
  };

  const handleCloseModalAtivar = () => {
    navigate('/equipamento_tipo');
    setModalAtivarOpen(false);
  };

  const handleChangeMotivo = (value: string) => {
    setMotivo(value);
  };

  const selectedTipo = equipamentoTipos.find(
    (tipo) => tipo?.id === selectedRow
  );

  const tableHeaders = [
    { key: 'created', label: 'Data de criação' },
    { key: 'tipo_nome', label: 'Tipo Equipamento' },
    { key: 'grupo_nomeX', label: 'Grupo Equipamento' },
    { key: 'array_operacoes', label: 'Operações' },
  ];

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Tipos de Equipamentos</h1>
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
                text={
                  selectedTipo && selectedTipo.inativo ? 'Ativar' : 'Desativar'
                }
                variant={selectedTipo && selectedTipo.inativo ? 'blue' : 'red'}
                icon={<MinusCircleIcon />}
                onClick={
                  selectedTipo && selectedTipo.inativo
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
      <DataTable
        id="table-equipamento_tipo"
        columns={tableHeaders}
        rows={equipamentoTipos}
        path="/equipamento_tipo"
        placeholder="Nenhum tipo de equipamento cadastrado."
      />
      <Outlet />

      {/* desativar modal */}
      {isModalDesativarOpen && (
        <Modal
          title="Desativar Tipo de Equipamento"
          handleCloseModal={handleCloseModalDesativar}
          variant="red"
          content={
            <>
              <p className="pl-1">{`Deseja desativar o tipo de equipamento ${selectedTipo?.tipo_nome} ?`}</p>
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
          title="Ativar Tipo de Equipamento"
          handleCloseModal={handleCloseModalAtivar}
          variant="red"
          content={`Deseja ativar o tipo de equipamento ${selectedTipo?.tipo_nome} ?`}
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
