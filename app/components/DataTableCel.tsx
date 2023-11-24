import type { ReactNode } from 'react';

export default function Cel({ children }: { children: ReactNode }) {
  return <td className="pl-2 border-r border-r-grey-light">{children}</td>;
}
