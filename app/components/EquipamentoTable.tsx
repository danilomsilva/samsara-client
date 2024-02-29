import { type PaginationType } from '~/utils/consts';
import { type ColumnType } from './DataTable';
import Column from './DataTableColumn';
import Pagination from './Pagination';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { useEffect } from 'react';
import Button from './Button';
import XIcon from './icons/XIcon';
import Tooltip from './Tooltip';
import InfoIcon from './icons/InfoIcon';
import { Link } from '@remix-run/react';

type PropTypes = {
  pagination: PaginationType;
  rows: any[];
  id: string;
  isFilterVisible?: boolean;
  setFilterVisible: (visible: boolean) => void;
  activeFilters: { [key: string]: string };
  setActiveFilters: (filters: { [key: string]: string }) => void;
};

const columns = [
  { key: 'tipo_equipamentoX', label: 'Tipo Equipamento' },
  { key: 'codigo', label: 'Código' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'ano', label: 'Ano' },
  { key: 'instrumento_medicao_inicio', label: 'IM Início' },
  { key: 'instrumento_medicao_atual', label: 'IM Atual' },
  { key: 'proxima_revisao', label: 'Próx. Revisão' },
  { key: 'revisao_status', label: 'Restante' },
  { key: 'encarregadoX', label: 'Encarregado' },
  { key: 'obraX', label: 'Obra' },
];

export default function EquipamentoTable({
  pagination,
  rows,
  id,
  isFilterVisible,
  setFilterVisible,
  activeFilters,
  setActiveFilters,
}: PropTypes) {
  const { selectedRow, setSelectedRow } = useSelectRow() as UseSelectedRow;

  useEffect(() => {
    setSelectedRow('');
  }, [setSelectedRow]);

  return (
    <div className="w-full h-full overflow-hidden rounded mt-4 pb-14 flex flex-col">
      <div
        className="overflow-y-auto h-full  scrollbar-thin scrollbar-thumb-grey/30 rounded scrollbar-thumb-rounded"
        style={{ scrollbarGutter: 'stable' }}
      >
        <table className="bg-white w-full text-sm" id={id}>
          <thead
            className={`${
              isFilterVisible ? '' : 'shadow-md'
            } sticky top-0 bg-white z-10`}
          >
            <tr className="text-left h-10">
              {columns.map((col: ColumnType, i: number) => (
                <Column
                  column={col.key}
                  key={i}
                  disabledSort={col.disabledSort ?? false}
                  isFilterVisible={isFilterVisible}
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                >
                  {col.label}
                </Column>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, rowIndex: number) => (
              <tr
                key={rowIndex}
                className={`${
                  selectedRow === row.id && 'bg-blue/20 text-blue'
                } h-10 border-b border-grey/10`}
                onClick={() => setSelectedRow(row.id)}
              >
                {columns.map((col: ColumnType, colIndex: number) => {
                  const colorsConditions =
                    row.grupo_equipamentoX === 'Máquina' ||
                    row.grupo_equipamentoX === 'Motocicleta'
                      ? 100
                      : row.grupo_equipamentoX === 'Caminhão' ||
                        row.grupo_equipamentoX === 'Automóvel'
                      ? 1000
                      : 100;

                  const revisaoStatusColor =
                    col.key === 'revisao_status' && row[col.key] <= 0
                      ? 'red'
                      : row[col.key] > 0 && row[col.key] <= colorsConditions
                      ? 'orange'
                      : 'green';

                  return (
                    <td key={colIndex} className="px-2 whitespace-nowrap">
                      {col.key === 'codigo' ? (
                        <div className="flex justify-between items-center w-full mr-1 gap-1">
                          <div className="whitespace-nowrap">
                            {row[col.key]}
                          </div>
                          <Tooltip
                            contentClassName="z-50"
                            content={`Número de série: ${row.numero_serie}`}
                          >
                            <InfoIcon className="h-6 w-6 text-orange" />
                          </Tooltip>
                        </div>
                      ) : col.key === 'revisao_status' ? (
                        <Link
                          to={`/manutencao/new?equip=${row.codigo}`}
                          className={`bg-${revisaoStatusColor} w-fit rounded-lg px-2 py-1 text-white font-semibold items-center justify-center mr-1 whitespace-nowrap`}
                        >
                          {row[col.key]}{' '}
                          {`${
                            row.instrumento_medicao === 'Horímetro' ? 'h' : 'km'
                          }`}
                        </Link>
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="flex justify-center items-center text-sm h-60 flex-col gap-4">
            <p>Nenhum resultado encontrado!</p>
            <Button
              icon={<XIcon className="w-4 h-4 ml-2" />}
              variant="blue"
              text="Limpar filtros"
              onClick={() => {
                setActiveFilters({});
                setFilterVisible(false);
              }}
            />
          </div>
        )}
      </div>
      <Pagination pagination={pagination} />
    </div>
  );
}
