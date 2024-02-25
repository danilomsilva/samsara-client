import { type PaginationType } from '~/utils/consts';
import { type ColumnType } from './DataTable';
import Column from './DataTableColumn';
import Pagination from './Pagination';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { useEffect } from 'react';

type PropTypes = {
  pagination: PaginationType;
  rows: any[];
  path: string;
  id: string;
};

const columns = [
  { key: 'created', label: 'Data de criação' },
  { key: 'nome', label: 'Nome da obra' },
  { key: 'cidade', label: 'Cidade' },
  { key: 'data_inicio', label: 'Data de início' },
  { key: 'data_final_previsto', label: 'Data final prevista' },
];

export default function ObraTable({ pagination, rows, id }: PropTypes) {
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
          <thead className="sticky top-0 bg-white shadow-md z-10">
            <tr className="text-left h-10">
              {columns.map((col: ColumnType, i: number) => (
                <Column
                  column={col.key}
                  key={i}
                  disabledSort={col.disabledSort ?? false}
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
                  <td key={colIndex} className="px-2">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pagination={pagination} />
    </div>
  );
}
