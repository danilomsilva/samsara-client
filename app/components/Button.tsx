import type { ReactNode } from 'react';

type PropTypes = {
  text: string;
  icon: ReactNode;
  name?: string;
  value?: string;
  variant: 'blue' | 'grey' | 'red';
};

export default function Button({
  text,
  icon,
  name,
  value,
  variant,
}: PropTypes) {
  const variantStyle = {
    blue: 'bg-blue hover:bg-blue/50',
    grey: 'bg-grey-dark hover:bg-grey-dark/50',
    red: 'bg-red hover:bg-red/50',
  };

  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={`${
        variant && variantStyle[variant]
      }  flex gap-2 p-2 px-4 rounded-lg justify-center h-10 items-center`}
    >
      <div className="flex items-center text-white font-semibold uppercase text-xs gap-4">
        {text}
        {icon}
      </div>
    </button>
  );
}
