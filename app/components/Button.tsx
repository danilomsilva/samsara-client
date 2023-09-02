import type { ReactNode } from 'react';

type PropTypes = {
  text: string;
  icon: ReactNode;
  className?: string;
  name?: string;
  value?: string;
};

export default function Button({
  text,
  icon,
  className,
  name,
  value,
}: PropTypes) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={`${className} bg-blue flex gap-2 p-2 px-4 rounded-lg justify-center h-10 items-center hover:bg-blue/50`}
    >
      <div className="flex items-center text-white font-semibold uppercase text-xs gap-4">
        {text}
        {icon}
      </div>
    </button>
  );
}
