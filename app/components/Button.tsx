import type { ReactNode } from 'react';
import { useIsSubmitting } from 'remix-validated-form';
import Spinner from '~/components/icons/Spinner';

type PropTypes = {
  text: string;
  icon: ReactNode;
  className?: string;
};

export default function Button({ text, icon, className }: PropTypes) {
  const isSubmitting = useIsSubmitting();
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`${className} bg-blue flex gap-2 p-2 px-4 rounded-lg justify-center h-10 items-center hover:bg-blue/50`}
    >
      {isSubmitting ? (
        <Spinner />
      ) : (
        <div className="flex items-center text-white font-semibold uppercase text-sm gap-2">
          {text}
          {icon}
        </div>
      )}
    </button>
  );
}
