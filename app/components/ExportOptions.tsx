import { Menu } from '@headlessui/react';
import ChevronDownIcon from './icons/ChrevronDownIcon';
import { CSVLink } from 'react-csv';
import { exportPDF, getCurrentDate } from '~/utils/utils';
import { type Operacao } from '~/models/operacao.server';

type ColumnType = {
  key: string;
  label: string;
  disabledSort?: boolean;
};

type PropTypes = {
  tableHeaders: ColumnType[];
  data: any[];
  filename: string;
};

export default function ExportOptions({
  tableHeaders,
  data,
  filename,
}: PropTypes) {
  if (filename === 'equipamento_tipo') {
    const formattedData = data.map((item) => {
      const operacoesCodigo = item.array_operacoes.map(
        (operacao: Operacao) => operacao.codigo
      );
      return {
        ...item,
        array_operacoes: operacoesCodigo.join(', '),
      };
    });
    data = formattedData;
  }
  return (
    <Menu as="div" className="relative  text-sm">
      <Menu.Button className="flex px-4 rounded-lg justify-center h-10 items-center bg-white font-semibold uppercase text-xs gap-2 text-blue hover:bg-grey/10">
        Exportar
        <ChevronDownIcon className="h-4 w-4 text-orange" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 bg-blue z-50 mt-1 rounded-lg flex flex-col text-white w-24 shadow-lg divide-y divide-grey/30 overflow-hidden">
        <Menu.Item
          className="h-10 flex justify-center items-center hover:bg-blue-light hover:text-white font-semibold text-xs cursor-pointer gap-2"
          as="div"
        >
          <CSVLink
            headers={tableHeaders}
            data={data}
            filename={`${filename}_${getCurrentDate()}`}
            className="w-full px-3 h-8 flex items-center justify-center"
          >
            CSV Simples
          </CSVLink>
        </Menu.Item>
        <Menu.Item
          className="h-10 flex justify-center items-center hover:bg-blue-light hover:text-white px-3 font-semibold text-xs cursor-pointer gap-2"
          as="div"
          onClick={() => exportPDF(`Relatório - ${filename}`, filename)}
        >
          PDF Simples
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
