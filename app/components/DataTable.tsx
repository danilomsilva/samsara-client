import Cel from './DataTableCel';
import Column from './DataTableColumn';
import ExclamationTriangle from './icons/ExclamationTriangle';

type ColumnType = {
  name: string;
  displayName: string;
};

type PropTypes = {
  columns: ColumnType[];
  rows:
    | {
        [key: string]: string;
      }[]
    | any;
};

export default function DataTable({ columns, rows }: PropTypes) {
  if (rows.length) {
    const rowKeys = Object.keys(rows[0]);
    return (
      <table className="bg-white w-full text-sm rounded mt-4 overflow-hidden">
        <thead>
          <tr className="text-left h-10 border-b border-b-grey/50">
            {columns.map(
              (col: { name: string; displayName: string }, i: number) => (
                <Column column={col.name} key={i}>
                  {col.displayName}
                </Column>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, i: number) => {
            return (
              <tr
                key={i}
                className="h-10 border-t-grey-light border-t hover:bg-blue/20"
              >
                {rowKeys.map((keys, i) => {
                  if (keys !== 'id') {
                    return <Cel key={i}>{row[keys]}</Cel>;
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
        <p>Nenhum usuário cadastrado.</p>
      </div>
    );
  }
}
