import { type ReactNode } from 'react';

type PropTypes = {
  className?: string;
  children: ReactNode;
};

export default function Row({ className, children }: PropTypes) {
  return <div className={`${className} flex gap-4`}>{children}</div>;
}
