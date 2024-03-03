import { type PaginationType } from '~/utils/consts';
import { type ColumnType } from './DataTable';
import Column from './DataTableColumn';
import Pagination from './Pagination';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { useEffect } from 'react';
import Button from './Button';
import XIcon from './icons/XIcon';
import Tooltip from './Tooltip';
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
  { key: 'created', label: 'Data de criação' },
  { key: 'codigo', label: 'Código' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'array_ordens_servico', label: 'Ordens de Serviço' },
];

export default function OperacaoTable({
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
                    {col.key === 'array_ordens_servico' ? (
                      <div className="flex flex-wrap gap-1 my-1">
                        {Array.isArray(row[col.key])
                          ? row[col.key].map((item: any) => {
                              return (
                                <Tooltip
                                  key={item}
                                  content={
                                    <>
                                      <p>{item.codigo}</p>
                                      <p>{item.descricao}</p>
                                    </>
                                  }
                                  contentClassName="whitespace-nowrap"
                                >
                                  <div className="bg-grey/30 rounded-md flex items-center px-1 cursor-default">
                                    {item.codigo}
                                  </div>
                                </Tooltip>
                              );
                            })
                          : ''}
                      </div>
                    ) : (
                      row[col.key]
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
