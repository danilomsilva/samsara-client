import { Menu } from '@headlessui/react';
import ChevronDownIcon from './icons/ChrevronDownIcon';
import { CSVLink } from 'react-csv';
import { exportPDF, getCurrentDate } from '~/utils/utils';

type ColumnType = {
  key: string;
  label: string;
  disabledSort?: boolean;
};

type PropTypes = {
  tableHeaders: ColumnType[];
  data: any[];
  filename: string;
  // extra?: string[];
};

export default function DropdownMenu({
  tableHeaders,
  data,
  filename,
}: // extra,
PropTypes) {
  return (
    <Menu as="div" className="relative  text-sm">
      <Menu.Button className="flex px-4 rounded-lg justify-center h-10 items-center bg-white font-semibold uppercase text-xs gap-2 text-grey border border-orange">
        Exportar
        <ChevronDownIcon className="h-4 w-4 text-orange" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 bg-white z-50 mt-2 rounded-lg flex flex-col text-grey-dark w-24 shadow-lg divide-y divide-grey/30">
        <Menu.Item
          className="h-10 flex justify-center items-center hover:bg-grey-light font-semibold text-xs cursor-pointer gap-2"
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
        {/* {extra && (
          <Menu.Item
            className="h-10 flex justify-center items-center hover:bg-grey-light px-3 font-semibold text-xs cursor-pointer gap-2"
            as="div"
            onClick={() =>
              exportPDF(`Relatório Completo - ${filename}`, filename)
            }
          >
            CSV Compl.
          </Menu.Item>
        )} */}
        <Menu.Item
          className="h-10 flex justify-center items-center hover:bg-grey-light px-3 font-semibold text-xs cursor-pointer gap-2"
          as="div"
          onClick={() => exportPDF(`Relatório - ${filename}`, filename)}
        >
          PDF Simples
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
