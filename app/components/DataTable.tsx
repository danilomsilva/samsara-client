import { Link, useSearchParams } from '@remix-run/react';
import Cel from './DataTableCel';
import Column from './DataTableColumn';
import ExclamationTriangle from './icons/ExclamationTriangle';

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
    const rowKeys = Object.keys(rows[0]);
    return (
      <table className="bg-white w-full text-sm rounded mt-4 overflow-hidden">
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
                {rowKeys.map((keys, i) => {
                  if (keys !== 'id') {
                    return (
                      <Cel key={i}>
                        <Link
                          to={selectedRow ? `${path}` : `./?selected=${row.id}`}
                        >
                          <div className="h-9 flex items-center">
                            {keys === 'tipo_acesso'
                              ? row[keys].replaceAll('_', ' ')
                              : row[keys]}
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
