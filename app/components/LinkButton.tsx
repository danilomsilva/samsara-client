import { Link } from '@remix-run/react';
import type { ReactNode } from 'react';
import { cn } from '~/utils/utils';

type PropTypes = {
  to: string;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  variant?: 'blue' | 'grey' | 'red' | 'green' | 'outlineNone';
};

export default function LinkButton({
  to,
  children,
  className,
  icon,
  variant,
}: PropTypes) {
  const variantStyle = {
    blue: 'bg-blue hover:bg-blue/50',
    outlineNone: 'bg-white text-blue',
    grey: 'bg-grey-dark hover:bg-grey-dark/50',
    red: 'bg-red hover:bg-red/50',
    green: 'bg-green hover:bg-green/50',
  };

  return (
    <Link
      to={to}
      className={cn(
        `${className} ${
          variant && variantStyle[variant]
        } flex px-4 rounded-lg justify-center h-10 items-center`
      )}
    >
      <div
        className={`${
          variant === 'outlineNone' ? 'text-blue' : ' text-white'
        } flex items-center font-semibold uppercase text-xs gap-2`}
      >
        {children}
        {icon}
      </div>
    </Link>
  );
}
