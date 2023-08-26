import { Link } from '@remix-run/react';
import type { ReactNode } from 'react';

type PropTypes = {
  to: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
};

export default function LinkButton({
  to,
  children,
  className,
  icon,
}: PropTypes) {
  return (
    <Link
      to={to}
      className={`${className} bg-blue flex px-4 rounded-lg justify-center h-10 items-center hover:bg-blue/50`}
    >
      <div className="flex items-center text-white font-semibold uppercase text-xs gap-2">
        {children}
        {icon}
      </div>
    </Link>
  );
}
