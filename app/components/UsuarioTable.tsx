import { type PaginationType } from '~/utils/consts';
import { type ColumnType } from './DataTable';
import Column from './DataTableColumn';
import Pagination from './Pagination';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { useEffect } from 'react';
import Button from './Button';
import XIcon from './icons/XIcon';

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
  { key: 'nome_completo', label: 'Nome completo' },
  { key: 'email', label: 'Email' },
  { key: 'tipo_acesso', label: 'Tipo de acesso' },
  { key: 'obraX', label: 'Alocado à obra' },
];

export default function UsuarioTable({
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
                {columns.map((col: ColumnType, colIndex: number) => (
                  <td key={colIndex} className="px-2 whitespace-nowrap">
                    {row[col.key]}
                  </td>
                ))}
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
