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
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import Button from '~/components/Button';
import CustomErrorBoundary from '~/components/ErrorBoundary';
import LinkButton from '~/components/LinkButton';
import Modal from '~/components/Modal';
import Textarea from '~/components/Textarea';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
import { getBoletins, updateBoletim } from '~/models/boletim.server';
import { getEquipamentos } from '~/models/equipamento.server';
import { getOperacoes } from '~/models/operacao.server';
import { getOSs } from '~/models/ordem-servico.server';
import {
  commitSession,
  getSession,
  getUserSession,
  setToastMessage,
} from '~/session.server';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import ReadIcon from '~/components/icons/ReadIcon';
import { checkDateValid, formatNumberWithDotDelimiter } from '~/utils/utils';
import ExportOptions from '~/components/ExportOptions';
import FilterIcon from '~/components/icons/FilterIcon';
import BoletimTable from '~/components/BoletimTable';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Boletim | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken, userId, tipoAcesso } = await getUserSession(request);
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

  if (userToken) {
    const boletinsResponse = await getBoletins(
      userToken,
      sortingBy,
      filter as string,
      page as string,
      perPage as string,
      tipoAcesso,
      userId
    );

    const transformedItems = boletinsResponse?.items?.map((item) => {
      const isHorimetro = item.instrumento_medicao === 'Horímetro';
      const suffix = isHorimetro ? ' h' : ' Km';
      return {
        ...item,
        IM_inicioX: `${
          item.IM_inicioX &&
          formatNumberWithDotDelimiter(Number(item.IM_inicioX))
        } ${suffix}`,
        IM_finalX: `${
          item.IM_finalX && formatNumberWithDotDelimiter(Number(item.IM_finalX))
        } ${suffix}`,
        total_abastecimento: `${item.total_abastecimento} L`,
      };
    });

    const transformedBoletins = {
      ...boletinsResponse,
      items: transformedItems,
    };
    const boletins =
      tipoAcesso === 'Encarregado'
        ? {
            ...boletinsResponse,
            items: transformedBoletins?.items?.filter(
              (item) => item.encarregado === userId
            ),
          }
        : transformedBoletins;

    const equipamentos = await getEquipamentos(userToken, 'created', '');
    const operacoes = await getOperacoes(userToken, 'created');
    const OSs = await getOSs(userToken, 'created');

    const boletinsToExport = boletins.items.flatMap((boletim) => {
      return boletim.equipamento_logs.map((log) => {
        return {
          ...boletim,
          ...log,
        };
      });
    });

    const newBoletinsToExport = boletinsToExport.map((boletim) => {
      const findOS = OSs.items.find((item) => {
        console.log(item.id, boletim.OS, item.id === boletim.OS);
        return item.id === boletim.OS;
      });

      const findOP = operacoes.items.find((item) => item.id === boletim.OP);
      const findEquipamento = equipamentos.items.find(
        (item) => item.id === boletim.equipamento
      );
      return {
        codigo: boletim.codigo,
        data_criacao: boletim.created,
        ultima_alteracao: boletim.updated,
        data_boletim: boletim.data_boletim,
        codigo_equipamento: findEquipamento?.codigo,
        tipo_equipamento: findEquipamento?.tipo_equipamentoX,
        grupo_equipamento: findEquipamento?.grupo_equipamentoX,
        numero_serie_equipamento: findEquipamento?.numero_serie,
        modelo_equipamento: findEquipamento?.modelo,
        ano_equipamento: findEquipamento?.ano,
        combustivel_equipamento: findEquipamento?.combustivel,
        IM: findEquipamento?.instrumento_medicao,
        valor_locacao_diario: findEquipamento?.valor_locacao_diario,
        valor_locacao_mensal: findEquipamento?.valor_locacao_mensal,
        valor_locacao_hora: findEquipamento?.valor_locacao_hora,
        total_abastecimento: boletim.total_abastecimento,
        lubrificacao: boletim.lubrificacao ? 'SIM' : 'NÃO',
        manutencao: boletim.manutencao ? 'SIM' : 'NÃO',
        descricao_manutencao: boletim.descricao_manutencao,
        limpeza: boletim.limpeza ? 'SIM' : 'NÃO',
        obra: boletim.obraX,
        nome_encarregado: boletim.encarregadoX,
        operador: boletim.operadorX,
        inativo: boletim.inativo ? 'SIM' : 'NÃO',
        inativo_motivo: boletim.motivo,
        OP_codigo: findOP?.codigo,
        OP_descricao: findOP?.descricao,
        OS_codigo: findOS?.codigo,
        OS_descricao: findOS?.descricao,
        hora_inicio: boletim.hora_inicio,
        hora_final: boletim.hora_final,
        IM_inicio: boletim.IM_inicio,
        IM_final: boletim.IM_final,
      };
    });
    // console.log(newBoletinsToExport);

    return json({ boletins, newBoletinsToExport });
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
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isModalDesativarOpen, setModalDesativarOpen] = useState(false);
  const [isModalAtivarOpen, setModalAtivarOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>(
    {}
  );
  const { boletins, newBoletinsToExport } = useLoaderData<typeof loader>();
  const { selectedRow } = useSelectRow() as UseSelectedRow;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    const timeout = setTimeout(() => {
      let newFilters = '';
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (key === 'created' || key === 'data_boletim') {
          // check if length of value is 10
          if (value.length === 10 && checkDateValid(value)) {
            const [day, month, year] = value.split('/');
            const date = `${year}-${month}-${day}`;
            if (Date.parse(date)) {
              newFilters += `(${key}>'${date}')`;
            }
          }
        } else if (key === 'manutencao') {
          // for boolean filters, no need to add single quotes to the value
          newFilters += `(${key}=${
            value === 'Sim' || value === 'sim'
              ? 'true'
              : value === 'Não' || value === 'não' || value === 'nao'
              ? 'false'
              : ''
          })`;
        } else if (
          key === 'IM_inicioX' ||
          key === 'IM_finalX' ||
          key === 'total_abastecimento'
        ) {
          newFilters += `(${key}>='${value}')`;
        } else {
          newFilters += `(${key}~'${value}')`;
        }
      });
      const splitFilters = newFilters.split(')(');
      const joinedFilters = splitFilters.join(')&&(');
      newSearchParams.set('filter', joinedFilters);
      navigate(`${location.pathname}?${newSearchParams.toString()}`);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [activeFilters]);

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

  const handleToggleFilters = () => {
    setFilterVisible(!isFilterVisible);
    if (isFilterVisible) {
      navigate('/boletim');
    }
  };

  const selectedBoletim = boletins.items.find(
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
            <>
              <ExportOptions
                tableHeaders={[
                  { key: 'data_criacao', label: 'Data de Criação' },
                  { key: 'data_boletim', label: 'Data do Boletim' },
                  { key: 'codigo', label: 'Boletim' },
                  { key: 'codigo_equipamento', label: 'Código Equipamento' },
                  { key: 'tipo_equipamento', label: 'Tipo Equipamento' },
                  { key: 'grupo_equipamento', label: 'Grupo Equipamento' },
                  {
                    key: 'numero_serie_equipamento',
                    label: 'Número Série Equipamento',
                  },
                  { key: 'modelo_equipamento', label: 'Modelo Equipamento' },
                  { key: 'ano_equipamento', label: 'Ano Equipamento' },
                  {
                    key: 'combustivel_equipamento',
                    label: 'Combustível Equipamento',
                  },
                  { key: 'IM', label: 'Tipo IM' },
                  {
                    key: 'valor_locacao_diario',
                    label: 'Valor Locação Diário',
                  },
                  {
                    key: 'valor_locacao_mensal',
                    label: 'Valor Locação Mensal',
                  },
                  { key: 'valor_locacao_hora', label: 'Valor Locação Hora' },
                  { key: 'total_abastecimento', label: 'Total Abastecimento' },
                  { key: 'lubrificacao', label: 'Lubrificação' },
                  { key: 'manutencao', label: 'Manutenção' },
                  {
                    key: 'descricao_manutencao',
                    label: 'Descrição Manutenção',
                  },
                  { key: 'limpeza', label: 'Limpeza' },
                  { key: 'obra', label: 'Obra' },
                  { key: 'nome_encarregado', label: 'Nome Encarregado' },
                  { key: 'operador', label: 'Nome Operador' },
                  { key: 'inativo', label: 'Boletim Inativo' },
                  { key: 'inativo_motivo', label: 'Inativo Motivo' },
                  { key: 'OP_codigo', label: 'Código Operação' },
                  { key: 'OP_descricao', label: 'Descrição Operação' },
                  { key: 'OS_codigo', label: 'Código OS' },
                  { key: 'OS_descricao', label: 'Descrição OS' },
                  { key: 'hora_inicio', label: 'Hora Início' },
                  { key: 'hora_final', label: 'Hora Final' },
                  { key: 'IM_inicio', label: 'IM Início' },
                  { key: 'IM_final', label: 'IM Final' },
                ]}
                data={newBoletinsToExport}
                filename="boletim"
              />

              {/* TODO: when closing filters, make sure to remove all the query params */}
              <Button
                variant={isFilterVisible ? 'blue' : 'outlined'}
                name="filters"
                icon={
                  <FilterIcon
                    className={`${
                      isFilterVisible ? 'text-white' : 'text-orange'
                    } h-4 w-4`}
                  />
                }
                onClick={handleToggleFilters}
              >
                Filtros
              </Button>
              <LinkButton to="./new" variant="blue" icon={<Add />}>
                Adicionar
              </LinkButton>
            </>
          )}
        </div>
      </div>
      <BoletimTable
        id="table-boletim"
        rows={boletins.items}
        pagination={{
          page: boletins.page,
          perPage: boletins.perPage,
          totalItems: boletins.totalItems,
          totalPages: boletins.totalPages,
        }}
        isFilterVisible={isFilterVisible}
        setFilterVisible={setFilterVisible}
        setActiveFilters={setActiveFilters}
        activeFilters={activeFilters}
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
