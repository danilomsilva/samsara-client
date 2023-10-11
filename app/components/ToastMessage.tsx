import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import CheckIcon from './icons/CheckIcon';
import InfoIcon from './icons/InfoIcon';
import ExclamationTriangle from './icons/ExclamationTriangle';
import InfoCircleIcon from './icons/InfoCircleIcon';
import XIcon from './icons/XIcon';

export type PropTypes = {
  variant: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  timestamp?: string;
};

const variants = {
  success: {
    borderColor: 'border-green',
    icon: <CheckIcon className="h-8 w-8 text-green" />,
  },
  info: {
    borderColor: 'border-blue',
    icon: <InfoIcon className="h-8 w-8 text-blue" />,
  },
  warning: {
    borderColor: 'border-orange',
    icon: <ExclamationTriangle className="h-8 w-8 text-orange" />,
  },
  error: {
    borderColor: 'border-red',
    icon: <InfoCircleIcon className="h-8 w-8 text-red" />,
  },
};

export default function ToastMessage({
  title,
  message,
  variant,
  timestamp,
}: PropTypes) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    const timeout = setTimeout(() => {
      setShow(false);
    }, 7000);

    return () => clearTimeout(timeout);
  }, [title, message, variant, timestamp]);

  return (
    <Transition
      show={show}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`${variants[variant].borderColor} min-h-12 absolute bottom-4 right-4 flex w-96  gap-4 border-t-8 bg-white py-4 pl-4 pr-3 text-sm shadow-lg rounded-lg`}
      >
        <div className="mt-0.5">{variants[variant].icon}</div>
        <div className="flex w-full gap-1">
          <div className="flex flex-1 flex-col">
            {title && <h3 className="h-5 font-bold">{title}</h3>}
            <div className="font-semibold">{message}</div>
          </div>
          <div
            className="hover:bg-white rounded-lg cursor-pointer flex h-fit"
            onClick={() => setShow(false)}
          >
            <XIcon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </Transition>
  );
}
