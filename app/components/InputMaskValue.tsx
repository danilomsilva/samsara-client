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

export default function fInputMaskValue({
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
    <div
      className={`${className} flex flex-col gap-px text-sm w-full relative`}
    >
      <label htmlFor={name} className=" text-white ml-1 text-xs font-normal">
        {label}
      </label>
      <ReactInputMask
        mask="99/99/9999"
        name={name}
        type={type}
        className={`${
          disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
        } rounded-lg pt-2 p-2 px-4 focus:outline-blue text-grey-dark`}
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
