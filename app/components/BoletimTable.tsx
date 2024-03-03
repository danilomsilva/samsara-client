import { type PaginationType } from '~/utils/consts';
import { type ColumnType } from './DataTable';
import Column from './DataTableColumn';
import Pagination from './Pagination';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { useEffect } from 'react';
import Button from './Button';
import XIcon from './icons/XIcon';
import { Link } from '@remix-run/react';
import CogIcon from './icons/CogIcon';
import TooltipDisabled from './TooltipDisabled';
import InfoIcon from './icons/InfoIcon';

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
  { key: 'created', label: 'Data criação' },
  { key: 'data_boletim', label: 'Data' },
  { key: 'codigo', label: 'Boletim' },
  { key: 'equipamentoX', label: 'Equip.' },
  { key: 'obraX', label: 'Obra' },
  { key: 'IM_inicioX', label: 'IM Início' },
  { key: 'IM_finalX', label: 'IM Final' },
  { key: 'total_abastecimento', label: 'Abast.' },
  { key: 'manutencao', label: 'Manutenção' },
  { key: 'operadorX', label: 'Operador' },
  { key: 'encarregadoX', label: 'Criado por' },
];

export default function BoletimTable({
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
                className={`${row.inativo && 'text-grey/30'} ${
                  selectedRow === row.id && 'bg-blue/20 text-blue'
                } h-10 border-b border-grey/10`}
                onClick={() => setSelectedRow(row.id)}
              >
                {columns.map((col: ColumnType, colIndex: number) => (
                  <td key={colIndex} className="px-2 whitespace-nowrap">
                    {col.key === 'boletim' && row[col.key] !== '-' ? (
                      <Link
                        to={`/boletim/${row[col.key]}`}
                        className="text-blue font-semibold cursor-pointer"
                      >
                        {row[col.key]}
                      </Link>
                    ) : (
                      <div className="mr-2 whitespace-nowrap">
                        {typeof row[col.key] === 'boolean' ? (
                          <div className="flex gap-1 items-center">
                            <CogIcon />
                            <p>{row[col.key] ? 'Sim' : 'Não'}</p>
                          </div>
                        ) : (
                          row[col.key]
                        )}
                      </div>
                    )}
                  </td>
                ))}
                {row.inativo && row.motivo.length > 0 && (
                  <td className="px-2 whitespace-nowrap">
                    <div className="flex items-center justify-center h-10">
                      <TooltipDisabled
                        contentClassName="z-50 -ml-60 w-72"
                        content={
                          <>
                            <p>Motivo da desativação:</p>
                            <p>{row.motivo}</p>
                          </>
                        }
                      >
                        <InfoIcon className="h-6 w-6 text-orange" />
                      </TooltipDisabled>
                    </div>
                  </td>
                )}
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
