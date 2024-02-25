import type { ReactNode } from 'react';

type PropTypes = {
  text?: string;
  icon: ReactNode;
  name?: string;
  value?: string;
  variant: 'blue' | 'grey' | 'red' | 'green' | 'outlined';
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
};

export default function Button({
  text,
  icon,
  name,
  value,
  variant,
  onClick,
  disabled,
  children,
}: PropTypes) {
  const variantStyle = {
    blue: `${disabled ? 'bg-blue/50' : 'bg-blue hover:bg-blue/50'}`,
    grey: `${
      disabled ? 'bg-grey-dark/50' : 'bg-grey-dark hover:bg-grey-dark/50/50'
    }`,
    red: `${disabled ? 'bg-red/50' : 'bg-red hover:bg-red/50'}`,
    green: `${disabled ? 'bg-green/50' : 'bg-green hover:bg-green/50'}`,
    outlined: `${
      disabled ? 'bg-white' : 'bg-white hover:bg-blue/50'
    } text-blue`,
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
      <div
        className={`${
          variant === 'outlined' ? 'text-blue' : 'text-white'
        } flex items-center font-semibold uppercase text-xs gap-2`}
      >
        {text}
        {icon}
        {children}
      </div>
    </button>
  );
}
