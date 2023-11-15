import { NumericFormat } from 'react-number-format';
import ErrorMessage from './ErrorMessage';

type PropTypes = {
  name: string;
  label: string;
  labelBold?: boolean;
  noLabel?: boolean;
  className?: string;
  type: 'text' | 'number' | 'password' | 'currency' | 'IM' | 'time';
  disabled?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  suffix?: string;
  readOnly?: boolean;
  tabIndex?: number;
  placeholder?: string;
};

export default function Input({
  name,
  labelBold,
  label,
  noLabel,
  className,
  type,
  disabled,
  defaultValue,
  autoFocus,
  error,
  onChange,
  suffix,
  readOnly,
  tabIndex,
  placeholder,
}: PropTypes) {
  return (
    <div className={`${className} flex flex-col gap-1 text-sm w-full`}>
      <label
        htmlFor={name}
        className={`${
          labelBold && 'font-bold text-grey/90'
        } text-grey-dark ml-1`}
      >
        {noLabel ? null : label}
      </label>
      {type === 'currency' ? (
        <NumericFormat
          name={name}
          className="rounded-lg p-2 px-4 focus:outline-blue h-9"
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          allowNegative={false}
          fixedDecimalScale
          decimalScale={2}
          defaultValue={defaultValue}
          placeholder={placeholder}
        />
      ) : type === 'IM' ? (
        <NumericFormat
          name={name}
          className={`${
            disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
          } rounded-lg p-2 px-4 focus:outline-blue h-9`}
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          fixedDecimalScale
          decimalScale={2}
          defaultValue={defaultValue}
          suffix={suffix}
          readOnly={readOnly}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          name={name}
          type={type}
          min={1}
          className={`${
            disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
          } rounded-lg p-2 px-4 focus:outline-blue h-9`}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          autoComplete="off"
          readOnly={readOnly}
          tabIndex={tabIndex}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {error && <ErrorMessage error={error} />}
    </div>
  );
}
