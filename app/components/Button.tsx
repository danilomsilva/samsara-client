import type { ReactNode } from 'react';

type PropTypes = {
  text: string;
  icon: ReactNode;
  name?: string;
  value?: string;
  variant: 'blue' | 'grey' | 'red';
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button({
  text,
  icon,
  name,
  value,
  variant,
  onClick,
  disabled,
}: PropTypes) {
  const variantStyle = {
    blue: `${disabled ? 'bg-blue/50' : 'bg-blue hover:bg-blue/50'}`,
    grey: `${
      disabled ? 'bg-grey-dark/50' : 'bg-grey-dark hover:bg-grey-dark/50/50'
    }`,
    red: `${disabled ? 'bg-red/50' : 'bg-red hover:bg-red/50'}`,
  };

  return (
    <button
      disabled={disabled}
      type="submit"
      name={name}
      value={value}
      className={`${
        variant && variantStyle[variant]
      }  flex gap-2 p-2 px-4 rounded-lg justify-center h-10 items-center`}
      onClick={onClick}
    >
      <div className="flex items-center text-white font-semibold uppercase text-xs gap-4">
        {text}
        {icon}
      </div>
    </button>
  );
}
