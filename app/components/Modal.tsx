import { type ReactNode } from 'react';
import XIcon from './icons/XIcon';
import { Form, Link } from '@remix-run/react';

type VariantStyle = {
  [key: string]: {
    borderTop: string;
    title?: string;
    iconColor?: string;
  };
};

type PropTypes = {
  title: string;
  variant?: 'blue' | 'grey' | 'red';
  size?: 'sm' | 'md' | 'lg' | 'xxl';
  content: ReactNode;
  footerSummary?: ReactNode;
  footerActions: ReactNode;
  handleCloseModal?: () => void;
};

export default function Modal({
  title,
  variant,
  size,
  content,
  footerSummary,
  footerActions,
  handleCloseModal,
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
    <div className="bg-black/30 absolute top-0 left-0 w-full h-screen flex justify-center items-center">
      <div
        className={`${
          variant && variantStyle[variant]?.borderTop
        } bg-grey-light rounded-lg border-t-8  ${
          size === 'xxl'
            ? 'w-[1200px]'
            : size === 'lg'
            ? 'w-[700px]'
            : size === 'sm'
            ? 'w-[400px]'
            : 'w-[500px]'
        }`}
      >
        <div className="flex border-b p-6 justify-between w-full border items-center border-b-grey/50 border-x-0 border-t-0">
          <h1
            className={`${
              variant && variantStyle[variant]?.title
            } font-bold text-xl`}
          >
            {title}
          </h1>
          {handleCloseModal ? (
            <div
              className="hover:bg-white/50 rounded-lg cursor-pointer"
              onClick={handleCloseModal}
            >
              <XIcon
                className={`${
                  variant && variantStyle[variant]?.iconColor
                } h-6 w-6 stroke-2 z-50`}
              />
            </div>
          ) : (
            <Link
              to=".."
              className="hover:bg-white/50 rounded-lg cursor-pointer"
            >
              <XIcon
                className={`${
                  variant && variantStyle[variant]?.iconColor
                } h-6 w-6 stroke-2 z-50`}
              />
            </Link>
          )}
        </div>
        <Form method="post">
          <div className="p-8 px-6 gap-2 flex flex-col">{content}</div>
          <div className="border-t-grey/50 border-x-0 border-b-0 border-t h-16 flex items-center px-6 justify-end">
            {footerSummary && <div className="w-full">{footerSummary}</div>}
            {footerActions}
          </div>
        </Form>
      </div>
    </div>
  );
}
