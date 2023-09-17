import { Link, useSearchParams } from '@remix-run/react';
import Cel from './DataTableCel';
import Column from './DataTableColumn';
import ExclamationTriangle from './icons/ExclamationTriangle';
import InfoIcon from './icons/InfoIcon';
import Tooltip from './Tooltip';

type ColumnType = {
  name: string;
  displayName: string;
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
};

export default function DataTable({
  columns,
  rows,
  path,
  placeholder,
}: PropTypes) {
  const [searchParams] = useSearchParams();
  const selectedRow = searchParams.get('selected');

  if (rows.length) {
    const columnNames = columns.map((col) => col.name);

    return (
      <table className="bg-white w-full text-sm rounded mt-4">
        <thead>
          <tr className="text-left h-10 border-b border-b-grey/50">
            {columns.map((col: ColumnType, i: number) => (
              <Column
                column={col.name}
                key={i}
                disabledSort={col.disabledSort ?? false}
              >
                {col.displayName}
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
              >
                {columnNames.map((columnName, i) => {
                  if (columnName !== 'id' && row.hasOwnProperty(columnName)) {
                    return (
                      <Cel key={i}>
                        <Link
                          to={selectedRow ? `${path}` : `./?selected=${row.id}`}
                        >
                          <div className="h-9 flex items-center">
                            {row.numero_serie &&
                            path === '/equipamento' &&
                            columnName === 'codigo' ? (
                              <div className="flex justify-between items-center w-full mr-1">
                                <div>{row[columnName]}</div>
                                <Tooltip
                                  contentClassName="w-[200px] z-50"
                                  content={`Número de série: ${row.numero_serie}`}
                                >
                                  <InfoIcon className="h-7 w-7 text-orange" />
                                </Tooltip>
                              </div>
                            ) : columnName === 'tipo_acesso' ||
                              columnName === 'combustivel' ? (
                              row[columnName].replaceAll('_', ' ')
                            ) : (
                              row[columnName]
                            )}
                          </div>
                        </Link>
                      </Cel>
                    );
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
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
