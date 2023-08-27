import { useField } from 'remix-validated-form';

type PropTypes = {
  name: string;
  label: string;
  className?: string;
  type: 'text' | 'number' | 'password';
};

export default function Input({ name, label, className, type }: PropTypes) {
  const { error, getInputProps } = useField(name);
  return (
    <div className={`${className} flex flex-col gap-1 text-sm w-full`}>
      <label htmlFor={name} className=" text-grey-dark ml-1">
        {label}
      </label>
      <input
        {...getInputProps({ id: name })}
        type={type}
        className="rounded-lg p-2 px-4 focus:outline-blue"
      />
      {error && <span className="text-red ml-1">{error}</span>}
    </div>
  );
}
