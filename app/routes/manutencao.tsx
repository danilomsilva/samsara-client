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
import { type Equipamento, getEquipamentos } from '~/models/equipamento.server';
import {
  type Manutencao,
  deleteManutencao,
  getManutencoes,
} from '~/models/manutencao.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { formatNumberWithDotDelimiter } from '~/utils/utils';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Manutenção | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken, tipoAcesso } = await getUserSession(request);
  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.get('sort');
  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn ? `${order === 'asc' ? '+' : '-'}${sortColumn}` : null;

  //encarregado do not have access to table manutencao
  if (userToken && tipoAcesso !== 'Encarregado') {
    const manutencoes = await getManutencoes(userToken, sortingBy);
    const equipamentos = await getEquipamentos(userToken, 'created');
    return json({ manutencoes, equipamentos });
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
      const manutencao = await deleteManutencao(
        userToken,
        formData.manutencaoId as string
      );
      if (
        manutencao.message &&
        manutencao.message.includes('required relation')
      ) {
        setToastMessage(
          session,
          'Erro',
          'Manutenção está vinculada à algum outro campo e não pode ser removida.',
          'error'
        );
        return redirect('/manutencao', {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        });
      }
    } catch (error) {}
    setToastMessage(session, 'Sucesso', 'Manutenção removida!', 'success');
    return redirect('/manutencao', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function ManutencaoPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const {
    manutencoes,
    equipamentos,
  }: { manutencoes: Manutencao[]; equipamentos: Equipamento[] } =
    useLoaderData();
  const navigate = useNavigate();
  const { selectedRow } = useSelectRow() as UseSelectedRow;

  const handleCloseModal = () => {
    navigate('/manutencao');
    setModalOpen(false);
  };

  const formattedManutencoes: Manutencao[] = manutencoes.map((manutencao) => {
    const isHorimetro =
      equipamentos.find((equip) => equip.codigo === manutencao.equipamentoX)
        ?.instrumento_medicao === 'Horímetro';
    const suffix = isHorimetro ? ' h' : ' km';
    return {
      ...manutencao,
      IM_atual: `${formatNumberWithDotDelimiter(
        Number(manutencao.IM_atual)
      )} ${suffix}`,
    };
  });

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Manutenções</h1>
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
          { name: 'created', displayName: 'Data de criação' },
          { name: 'boletim', displayName: 'Boletim' },
          { name: 'equipamentoX', displayName: 'Equipamento' },
          { name: 'IM_atual', displayName: 'Horím./Odôm.' },
          { name: 'tipo_manutencao', displayName: 'Tipo de Manutenção' },
          { name: 'feito_porX', displayName: 'Feito por' },
          { name: 'encarregadoX', displayName: 'Encarregado' },
        ]}
        rows={formattedManutencoes}
        path="/manutencao"
        placeholder="Nenhuma manutenção cadastrada."
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Remover Manutenção"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja excluir manutenção ?`} //TODO: improve!
          footerActions={
            <Form method="post">
              <input
                type="hidden"
                name="manutencaoId"
                value={selectedRow || ''}
              />
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
