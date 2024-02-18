import { Link } from '@remix-run/react';
import type { ReactNode } from 'react';

type PropTypes = {
  to: string;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  variant?: 'blue' | 'grey' | 'red' | 'green';
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
    grey: 'bg-grey-dark hover:bg-grey-dark/50',
    red: 'bg-red hover:bg-red/50',
    green: 'bg-green hover:bg-green/50',
  };

  return (
    <Link
      to={to}
      className={`${className} ${
        variant && variantStyle[variant]
      } flex px-4 rounded-lg justify-center h-10 items-center`}
    >
      <div className="flex items-center text-white font-semibold uppercase text-xs gap-2">
        {children}
        {icon}
      </div>
    </Link>
  );
}
