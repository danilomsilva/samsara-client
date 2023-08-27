import { type ReactNode } from 'react';
import XIcon from './icons/XIcon';
import LinkButton from './LinkButton';
import PlusCircleIcon from './icons/PlusCircleIcon';

type PropTypes = {
  children: ReactNode;
};

export default function Modal({ children }: PropTypes) {
  return (
    <div className="bg-black/30 absolute top-0 left-0 w-full h-screen flex justify-center items-center">
      <div className="bg-grey-light rounded-lg border-t-8 border-t-blue w-[500px]">
        <div className="flex border-b px-8 p-6 justify-between w-full border items-center border-b-grey/50 border-x-0 border-t-0">
          <h1 className="font-bold text-2xl text-blue">Adicionar Obra</h1>
          <XIcon className="h-6 w-6 text-blue stroke-2" />
        </div>
        <div className="bg-white h-80 p-8">{children}</div>
        <div className="border-b-grey/50 border-x-0 border-b-0 border-t h-16 flex items-center px-4 justify-end">
          <LinkButton to="./new" className="bg-blue" icon={<PlusCircleIcon />}>
            Adicionar
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
