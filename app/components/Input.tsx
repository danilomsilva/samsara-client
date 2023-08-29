import { useField } from 'remix-validated-form';
import ExclamationTriangle from './icons/ExclamationTriangle';

type PropTypes = {
  name: string;
  label: string;
  className?: string;
  type: 'text' | 'number' | 'password';
  disabled?: boolean;
  defaultValue?: string;
};

export default function Input({
  name,
  label,
  className,
  type,
  disabled,
  defaultValue,
}: PropTypes) {
  const { error, getInputProps } = useField(name);
  return (
    <div className={`${className} flex flex-col gap-1 text-sm w-full`}>
      <label htmlFor={name} className=" text-grey-dark ml-1">
        {label}
      </label>
      <input
        {...getInputProps({ id: name })}
        type={type}
        className={`${
          disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
        } rounded-lg p-2 px-4 focus:outline-blue`}
        // defaultValue={defaultValue}
        value={defaultValue}
      />
      {error && (
        <div className="flex gap-1 items-center">
          <ExclamationTriangle className="h-3 w-3 text-red" />
          <span className="text-red ml-1">{error}</span>
        </div>
      )}
    </div>
  );
}
