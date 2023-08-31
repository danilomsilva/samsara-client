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
  return (
    <div className={`${className} flex flex-col gap-1 text-sm w-full`}>
      <label htmlFor={name} className=" text-grey-dark ml-1">
        {label}
      </label>
      <input
        type={type}
        className={`${
          disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
        } rounded-lg p-2 px-4 focus:outline-blue`}
        // defaultValue={defaultValue}
        value={defaultValue}
        autoFocus={autoFocus}
      />
    </div>
  );
}
