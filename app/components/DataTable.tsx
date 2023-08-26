type PropTypes = {
  columns: string[];
  rows: any; // TODO: improve on this type after retrieving data from DB
};
export default function DataTable({ columns, rows }: PropTypes) {
  return (
    <table className="bg-white w-full text-sm rounded mt-4 overflow-hidden">
      <thead>
        <tr className="text-left h-10 border-b border-b-grey/50">
          {columns.map((col, i) => (
            <Column key={i}>{col}</Column>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any, i: number) => (
          <tr
            key={i}
            className="h-10 border-t-grey-light border-t hover:bg-blue/20"
          >
            <Cel>{row.name}</Cel>
            <Cel>{row.country}</Cel>
            <Cel>{row.name}</Cel>
            <Cel>{row.country}</Cel>
            <Cel>{row.name}</Cel>
            <Cel>{row.country}</Cel>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Column({ children }: { children: string }) {
  return <th className="pl-4 font-semibold">{children}</th>;
}

function Cel({ children }: { children: string }) {
  return <td className="pl-4 border-r border-r-grey-light">{children}</td>;
}
