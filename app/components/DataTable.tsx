import Cel from './DataTableCel';
import Column from './DataTableColumn';
import ExclamationTriangle from './icons/ExclamationTriangle';
import InfoIcon from './icons/InfoIcon';
import Tooltip from './Tooltip';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import { useEffect } from 'react';
import CogIcon from './icons/CogIcon';

type ColumnType = {
  key: string;
  label: string;
  disabledSort?: boolean;
};

type PropTypes = {
  columns: ColumnType[];
  rows:
    | {
        [key: string]: string;
      }[]
    | any;
  path: string;
  placeholder: string;
  id?: string;
};

export default function DataTable({
  columns,
  rows,
  path,
  placeholder,
  id,
}: PropTypes) {
  const { selectedRow, setSelectedRow } = useSelectRow() as UseSelectedRow;

  useEffect(() => {
    setSelectedRow('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (rows.length) {
    const columnNames = columns.map((col) => col.key);

    return (
      <div className="w-full h-full overflow-hidden rounded mt-4 pb-14">
        <div
          className="overflow-y-auto h-full  scrollbar-thin scrollbar-thumb-grey/30 rounded scrollbar-thumb-rounded"
          style={{ scrollbarGutter: 'stable' }}
        >
          <table className="bg-white w-full text-sm" id={id}>
            <thead className="sticky top-0 bg-white shadow-sm">
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
              {rows.map((row: any, i: number) => {
                return (
                  <tr
                    key={i}
                    className={`${
                      selectedRow === row.id && 'bg-blue/20 text-blue'
                    } h-10 border-t-grey-light border-t hover:bg-blue/20`}
                    onClick={() => setSelectedRow(row.id)}
                  >
                    {columnNames.map((columnName, i) => {
                      if (
                        columnName !== 'id' &&
                        row.hasOwnProperty(columnName)
                      ) {
                        return (
                          <Cel key={i}>
                            <div className="h-9 flex items-center">
                              {row.numero_serie &&
                              path === '/equipamento' &&
                              columnName === 'codigo' ? (
                                <div className="flex justify-between items-center w-full mr-1 gap-2">
                                  <div className="whitespace-nowrap">
                                    {row[columnName]}
                                  </div>
                                  <Tooltip
                                    contentClassName="w-[200px] z-50"
                                    content={`Número de série: ${row.numero_serie}`}
                                  >
                                    <InfoIcon className="h-7 w-7 text-orange" />
                                  </Tooltip>
                                </div>
                              ) : (
                                <div className="mr-2 whitespace-nowrap">
                                  {/* TODO: pass icon dinamically instead of hardcode COG */}
                                  {typeof row[columnName] === 'boolean' ? (
                                    <div className="flex gap-1 items-center">
                                      <CogIcon />
                                      <p>{row[columnName] ? 'Sim' : 'Não'}</p>
                                    </div>
                                  ) : (
                                    row[columnName]
                                  )}
                                </div>
                              )}
                            </div>
                          </Cel>
                        );
                      }
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  } else {
    return (
      <div className="mt-20 flex flex-col items-center">
        <ExclamationTriangle className="h-10 w-10 text-grey/70" />
        <p>{placeholder}</p>
      </div>
    );
  }
}
