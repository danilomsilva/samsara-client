import { type ReactNode } from 'react';
import XIcon from './icons/XIcon';
import { Form, Link } from '@remix-run/react';

type PropTypes = {
  title: string;
  variant?: 'blue' | 'grey' | 'red';
  content: ReactNode;
  footerActions: ReactNode;
};

type VariantStyle = {
  [key: string]: {
    borderTop: string;
    title?: string;
    iconColor?: string;
  };
};

export default function Modal({
  title,
  variant,
  content,
  footerActions,
}: PropTypes) {
  const variantStyle: VariantStyle = {
    blue: {
      borderTop: 'border-t-blue',
      title: 'text-blue',
      iconColor: 'text-blue',
    },
    grey: {
      borderTop: 'border-t-grey',
      title: 'text-grey',
      iconColor: 'text-grey',
    },
    red: {
      borderTop: 'border-t-red',
      title: 'text-red',
      iconColor: 'text-red',
    },
  };
  return (
    // TODO: find a way to close modal by clicking on overlay making sure it will navigate back to previous route and not to initial route
    <div className="bg-black/30 absolute top-0 left-0 w-full h-screen flex justify-center items-center z-10">
      <div
        className={`${
          variant && variantStyle[variant]?.borderTop
        } bg-grey-light rounded-lg border-t-8 w-[500px]`}
      >
        <div className="flex border-b px-8 p-6 justify-between w-full border items-center border-b-grey/50 border-x-0 border-t-0">
          <h1
            className={`${
              variant && variantStyle[variant]?.title
            } font-bold text-xl`}
          >
            {title}
          </h1>
          <Link to=".." className="hover:bg-white/50 rounded-lg cursor-pointer">
            <XIcon
              className={`${
                variant && variantStyle[variant]?.iconColor
              } h-6 w-6 stroke-2 z-50`}
            />
          </Link>
        </div>
        <Form method="post">
          <div className="p-8 gap-2 flex flex-col">{content}</div>
          <div className="border-t-grey/50 border-x-0 border-b-0 border-t h-16 flex items-center px-4 justify-end">
            {footerActions}
          </div>
        </Form>
      </div>
    </div>
  );
}
