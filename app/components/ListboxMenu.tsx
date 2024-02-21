import { Menu } from '@headlessui/react';
import ChevronUpIcon from './icons/ChevronUpIcon';

export default function ListboxMenu({
  handleChangePerPage,
  perPage,
}: {
  handleChangePerPage: (value: string) => void;
  perPage: number;
}) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex rounded-lg justify-center h-8 px-2 items-center bg-white font-semibold uppercase text-xs gap-2 text-blue hover:bg-grey/10">
        {perPage}
        <ChevronUpIcon className="h-4 w-4 text-orange" />
      </Menu.Button>

      <Menu.Items className="absolute bg-white z-50 mb-1 rounded-lg flex flex-col text-grey-dark w-12 shadow-lg divide-y divide-grey/30 bottom-full overflow-hidden">
        <Menu.Item
          className="hover:bg-blue/50 font-semibold text-xs cursor-pointer gap-2 p-2 hover:text-white"
          as="div"
          onClick={() => handleChangePerPage('30')}
        >
          30
        </Menu.Item>
        <Menu.Item
          className="hover:bg-blue/50 font-semibold text-xs cursor-pointer gap-2 hover:text-white p-2"
          as="div"
          onClick={() => handleChangePerPage('50')}
        >
          50
        </Menu.Item>
        <Menu.Item
          className="hover:bg-blue/50 font-semibold text-xs cursor-pointer gap-2 hover:text-white p-2"
          as="div"
          onClick={() => handleChangePerPage('100')}
        >
          100
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}
