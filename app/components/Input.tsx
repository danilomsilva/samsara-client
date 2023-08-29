import { useField } from 'remix-validated-form';
import ErrorMessage from './ErrorMessage';

type PropTypes = {
  name: string;
  label: string;
  className?: string;
  type: 'text' | 'number' | 'password';
  disabled?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
};

export default function Input({
  name,
  label,
  className,
  type,
  disabled,
  defaultValue,
  autoFocus,
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
        } rounded-lg p-2 px-4 focus:outline-blue ${
          error && 'border border-red'
        }`}
        // defaultValue={defaultValue}
        value={defaultValue}
        autoComplete="new-password" // TODO: revisit and improve
        autoFocus={autoFocus}
      />
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
