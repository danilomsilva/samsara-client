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
import ListIcon from '~/components/icons/ListIcon';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import {
  type Equipamento,
  deleteEquipamento,
  getEquipamentos,
} from '~/models/equipamento.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { formatCurrency, formatNumberWithDotDelimiter } from '~/utils/utils';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Equipamento | Samsara' }];
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
    const equipamentos = await getEquipamentos(userToken, sortingBy);
    return json({ equipamentos });
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
      const equipamento = await deleteEquipamento(
        userToken,
        formData.userId as string
      );
      if (
        equipamento.message &&
        equipamento.message.includes('required relation')
      ) {
        setToastMessage(
          session,
          'Erro',
          'Equipamento está vinculado à algum outro campo e não pode ser removido.',
          'error'
        );
        return redirect('/equipamento', {
          headers: {
            'Set-Cookie': await commitSession(session),
          },
        });
      }
    } catch (error) {}
    setToastMessage(session, 'Sucesso', 'Equipamento removido!', 'success');
    return redirect('/equipamento', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  }
  return json({});
}

export default function EquipamentoPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { equipamentos }: { equipamentos: Equipamento[] } = useLoaderData();
  const navigate = useNavigate();
  const { selectedRow } = useSelectRow() as UseSelectedRow;

  const handleCloseModal = () => {
    navigate('/equipamento');
    setModalOpen(false);
  };

  const deletingEquipamento = equipamentos.find((eq) => eq?.id === selectedRow);

  const formattedEquipamentos: Equipamento[] = equipamentos.map((item) => {
    const isHorimetro = item.instrumento_medicao === ('Horímetro' as string);
    const suffix = isHorimetro ? ' h' : ' Km';
    return {
      ...item,
      combustivel: item.combustivel?.replaceAll('_', ' '),
      valor_locacao: formatCurrency(Number(item.valor_locacao)),
      instrumento_medicao_inicio: `${
        item.instrumento_medicao_inicio &&
        formatNumberWithDotDelimiter(Number(item.instrumento_medicao_inicio))
      } ${suffix}`,
      instrumento_medicao_atual: `${
        item.instrumento_medicao_atual &&
        formatNumberWithDotDelimiter(Number(item.instrumento_medicao_atual))
      } ${suffix}`,
      frequencia_revisao: `${
        item.frequencia_revisao &&
        formatNumberWithDotDelimiter(Number(item.frequencia_revisao))
      } ${suffix}`,
      proxima_revisao: `${
        item.proxima_revisao &&
        formatNumberWithDotDelimiter(Number(item.proxima_revisao))
      } ${suffix}`,
    };
  });

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Equipamentos</h1>
        <div className="flex gap-4">
          {selectedRow ? (
            <>
              <LinkButton
                to={`/manutencao?filter=${selectedRow}`}
                variant="blue"
                icon={<ListIcon />}
              >
                Histórico de manutenção
              </LinkButton>
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
          { name: 'codigo', displayName: 'Código' },
          { name: 'obraX', displayName: 'Alocado à obra' },
          { name: 'valor_locacao', displayName: 'Custo' },
          { name: 'tipo_locacao', displayName: 'Locação' },
          { name: 'ano', displayName: 'Ano' },
          { name: 'combustivel', displayName: 'Combustível' },
          { name: 'instrumento_medicao', displayName: 'Tipo IM' },
          { name: 'encarregadoX', displayName: 'Encarregado' },
          { name: 'instrumento_medicao_inicio', displayName: 'IM Início' },
          { name: 'instrumento_medicao_atual', displayName: 'IM Atual' },
          { name: 'frequencia_revisao', displayName: 'Revisão' },
          { name: 'proxima_revisao', displayName: 'Próx. Revisão' },
        ]}
        rows={formattedEquipamentos}
        path="/equipamento"
        placeholder="Nenhum equipamento cadastrado"
      />
      <Outlet />

      {/* delete modal */}
      {isModalOpen && (
        <Modal
          title="Remover Equipamento"
          handleCloseModal={handleCloseModal}
          variant="red"
          content={`Deseja excluir o equipamento ${deletingEquipamento?.codigo} ?`}
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
