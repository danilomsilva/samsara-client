import ErrorMessage from './ErrorMessage';
import ReactInputMask from 'react-input-mask';

type PropTypes = {
  name: string;
  label: string;
  className?: string;
  type: 'text';
  disabled?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
  error?: string;
  mask: string;
};

export default function InputMask({
  name,
  label,
  className,
  type,
  disabled,
  defaultValue,
  autoFocus,
  error,
  mask,
}: PropTypes) {
  return (
    <div className={`${className} flex flex-col gap-1 text-sm w-full`}>
      <label htmlFor={name} className=" text-grey-dark ml-1">
        {label}
      </label>
      <ReactInputMask
        mask={mask}
        name={name}
        type={type}
        className={`${
          disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
        } rounded-lg p-2 px-4 focus:outline-blue`}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
