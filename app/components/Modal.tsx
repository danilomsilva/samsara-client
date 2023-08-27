import { type ReactNode } from 'react';
import XIcon from './icons/XIcon';
import { Link } from '@remix-run/react';

type PropTypes = {
  title: string;
  children: ReactNode;
  footerActions: ReactNode;
};

export default function Modal({ title, children, footerActions }: PropTypes) {
  return (
    // TODO: find a way to close modal by clicking on overlay making sure it will navigate back to previous route and not to initial route
    <div className="bg-black/30 absolute top-0 left-0 w-full h-screen flex justify-center items-center z-10">
      <div className="bg-grey-light rounded-lg border-t-8 border-t-blue w-[500px]">
        <div className="flex border-b px-8 p-6 justify-between w-full border items-center border-b-grey/50 border-x-0 border-t-0">
          <h1 className="font-bold text-xl text-blue">{title}</h1>
          <Link to=".." className="hover:bg-white/50 rounded-lg cursor-pointer">
            <XIcon className="h-6 w-6 text-blue stroke-2 z-50" />
          </Link>
        </div>
        <div className="h-80 p-8">{children}</div>
        <div className="border-t-grey/50 border-x-0 border-b-0 border-t h-16 flex items-center px-4 justify-end">
          {footerActions}
        </div>
      </div>
    </div>
  );
}
