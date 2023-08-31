import type { ReactNode } from 'react';
import SpinnerIcon from '~/components/icons/SpinnerIcon';

type PropTypes = {
  text: string;
  icon: ReactNode;
  className?: string;
};

export default function Button({ text, icon, className }: PropTypes) {
  return (
    <button
      type="submit"
      // disabled={isSubmitting}
      className={`${className} bg-blue flex gap-2 p-2 px-4 rounded-lg justify-center h-10 items-center hover:bg-blue/50`}
    >
      {/* {isSubmitting ? (
        <SpinnerIcon />
      ) : (
        <div className="flex items-center text-white font-semibold uppercase text-xs gap-4">
          {text}
          {icon}
        </div>
      )} */}
      <div className="flex items-center text-white font-semibold uppercase text-xs gap-4">
        {text}
        {icon}
      </div>
    </button>
  );
}
