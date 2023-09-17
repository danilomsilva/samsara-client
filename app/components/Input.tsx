import { NumericFormat } from 'react-number-format';
import ErrorMessage from './ErrorMessage';

type PropTypes = {
  name: string;
  label: string;
  className?: string;
  type: 'text' | 'number' | 'password' | 'currency';
  disabled?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
  error?: string;
};

export default function Input({
  name,
  label,
  className,
  type,
  disabled,
  defaultValue,
  autoFocus,
  error,
}: PropTypes) {
  return (
    <div className={`${className} flex flex-col gap-1 text-sm w-full`}>
      <label htmlFor={name} className=" text-grey-dark ml-1">
        {label}
      </label>
      {type === 'currency' ? (
        <NumericFormat
          name="valor_locacao"
          className="rounded-lg p-2 px-4 focus:outline-blue h-9"
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          allowNegative={false}
          decimalScale={2}
        />
      ) : (
        <input
          name={name}
          type={type}
          min={1}
          className={`${
            disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
          } rounded-lg p-2 px-4 focus:outline-blue`}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          autoComplete="off"
        />
      )}

      {error && <ErrorMessage error={error} />}
    </div>
  );
}
