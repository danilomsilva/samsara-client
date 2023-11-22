import ErrorMessage from './ErrorMessage';
import ReactInputMask from 'react-input-mask';

type PropTypes = {
  name: string;
  label: string;
  className?: string;
  type: 'text';
  disabled?: boolean;
  value?: string;
  autoFocus?: boolean;
  error?: string;
  onChange?: (e: Event) => void;
};

export default function InputMaskValue({
  name,
  label,
  className,
  type,
  disabled,
  value,
  autoFocus,
  error,
  onChange,
}: PropTypes) {
  return (
    <div className={`${className} flex flex-col gap-1 text-sm w-full`}>
      <label htmlFor={name} className=" text-grey-dark ml-1">
        {label}
      </label>
      <ReactInputMask
        mask="99/99/9999"
        name={name}
        type={type}
        className={`${
          disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
        } rounded-lg p-2 px-4 focus:outline-blue border border-orange`}
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        onChange={onChange}
        placeholder={'__/__/____'}
      />
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
