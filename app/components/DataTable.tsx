import Cel from './DataTableCel';
import Column from './DataTableColumn';

type PropTypes = {
  columns: any;
  rows: any; // TODO: think how to type columns and rows
};
export default function DataTable({ columns, rows }: PropTypes) {
  return (
    <table className="bg-white w-full text-sm rounded mt-4 overflow-hidden">
      <thead>
        <tr className="text-left h-10 border-b border-b-grey/50">
          {columns.map((col, i: number) => (
            <Column column={col.name} key={i}>
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
              className="h-10 border-t-grey-light border-t hover:bg-blue/20"
            >
              <Cel>{row.created}</Cel>
              <Cel>{row.codigo}</Cel>
              <Cel>{row.nome_completo}</Cel>
              <Cel>{row.email}</Cel>
              <Cel>{row.tipo_acesso}</Cel>
              <Cel>{row.obra}</Cel>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
