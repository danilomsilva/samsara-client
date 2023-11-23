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
import DropdownMenu from '~/components/DropdownMenu';
import CustomErrorBoundary from '~/components/ErrorBoundary';
import FilterOptions from '~/components/FilterOptions';
import LinkButton from '~/components/LinkButton';
import Modal from '~/components/Modal';
import Textarea from '~/components/Textarea';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import {
  type Boletim,
  getBoletins,
  updateBoletim,
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
  const filter = searchParams.get('filter');
  const sortParam = searchParams.get('sort');
  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn ? `${order === 'asc' ? '+' : '-'}${sortColumn}` : null;

  if (userToken) {
    const boletins = await getBoletins(userToken, sortingBy, filter as string);
    return json({ boletins });
  } else {
    throw json('Acesso proibido', { status: 403 });
  }
}

export async function action({ request }: ActionArgs) {
  const { userToken } = await getUserSession(request);
  const session = await getSession(request);
  const formData = Object.fromEntries(await request.formData());

  if (formData?._action === 'desativar') {
    await updateBoletim(userToken, formData.boletimId as string, {
      inativo: true,
      motivo: formData?.motivo as string,
    });
    setToastMessage(session, 'Sucesso', 'Boletim desativado!', 'success');
    return redirect('/boletim', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }

  if (formData?._action === 'ativar') {
    await updateBoletim(userToken, formData.boletimId as string, {
      inativo: false,
      motivo: '',
    });
    setToastMessage(session, 'Sucesso', 'Boletim ativado!', 'success');
    return redirect('/boletim', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function BoletinsPage() {
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const { boletins }: { boletins: Boletim[] } = useLoaderData();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const { selectedRow } = useSelectRow() as UseSelectedRow;
  const navigate = useNavigate();

  const handleCloseModalDesativar = () => {
    navigate('/boletim');
    setModalDesativarOpen(false);
  };

  const handleCloseModalAtivar = () => {
    navigate('/boletim');
    setModalAtivarOpen(false);
  };

  const handleChangeMotivo = (value: string) => {
    setMotivo(value);
  };

  const selectedBoletim = boletins.find(
    (boletim) => boletim?.id === selectedRow
  );

  const tableHeaders = [
    { key: 'created', label: 'Data criação' },
    { key: 'data_boletim', label: 'Data' },
    { key: 'codigo', label: 'Boletim' },
    { key: 'equipamentoX', label: 'Equipamento' },
    { key: 'obraX', label: 'Obra' },
    { key: 'IM_inicioX', label: 'IM Início' },
    { key: 'IM_finalX', label: 'IM Final' },
    { key: 'total_abastecimento', label: 'Abastecimento' },
    { key: 'manutencao', label: 'Manutenção' },
    { key: 'operadorX', label: 'Operador' },
    { key: 'encarregadoX', label: 'Criado por' },
  ];

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Boletins</h1>
        {!selectedRow && (
          <div className="flex gap-2">
            <FilterOptions />
            <DropdownMenu
              tableHeaders={tableHeaders}
              data={boletins}
              filename="boletim"
            />
          </div>
        )}
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
                text={selectedBoletim?.inativo ? 'Ativar' : 'Desativar'}
                variant={selectedBoletim?.inativo ? 'blue' : 'red'}
                icon={<MinusCircleIcon />}
                onClick={
                  selectedBoletim?.inativo
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
        id="table-boletim"
        columns={tableHeaders}
        rows={boletins}
        path="/boletim"
        placeholder={
          filter
            ? 'Nenhum boletim iniciado no período selecionado!'
            : 'Nenhum boletim cadastrado.'
        }
      />
      <Outlet />

      {/* desativar modal */}
      {isModalDesativarOpen && (
        <Modal
          title="Desativar Boletim"
          handleCloseModal={handleCloseModalDesativar}
          variant="red"
          content={
            <>
              <p className="pl-1">{`Deseja desativar o boletim ${selectedBoletim?.codigo}?`}</p>
              <Textarea
                name="motivo-text-area"
                label="Motivo:"
                onChange={handleChangeMotivo}
              />
            </>
          }
          footerActions={
            <Form method="post">
              <input type="hidden" name="boletimId" value={selectedRow || ''} />
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
          title="Ativar Boletim"
          handleCloseModal={handleCloseModalAtivar}
          variant="red"
          content={`Deseja ativar o boletim ${selectedBoletim?.codigo} ?`}
          footerActions={
            <Form method="post">
              <input type="hidden" name="boletimId" value={selectedRow || ''} />
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
