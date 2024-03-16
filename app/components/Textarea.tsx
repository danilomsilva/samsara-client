import ErrorMessage from './ErrorMessage';

type PropTypes = {
  name: string;
  label: string;
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
  error?: string;
  onChange?: (value: string) => void;
};

export default function Textarea({
  name,
  label,
  className,
  disabled,
  defaultValue,
  error,
  onChange,
}: PropTypes) {
  return (
    <div className={`${className} flex flex-col gap-1 text-sm w-full`}>
      <label htmlFor={name} className=" text-grey-dark ml-1">
        {label}
      </label>
      <textarea
        name={name}
        className={`${
          disabled &&
          'border border-grey/50 bg-grey/10 scrollbar-thin scrollbar-thumb-grey/30 rounded scrollbar-thumb-rounded'
        } rounded-lg px-4 py-2 focus:outline-blue h-28`}
        disabled={disabled}
        defaultValue={defaultValue}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
