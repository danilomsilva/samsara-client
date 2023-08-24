import { useField } from "remix-validated-form";

type PropTypes = {
  name: string;
  label: string;
};

export default function Input({ name, label }: PropTypes) {
  const { error, getInputProps } = useField(name);
  return (
    <div className="flex flex-col gap-2 text-sm">
      <label htmlFor={name} className=" text-grey-dark">
        {label}
      </label>
      <input
        {...getInputProps({ id: name })}
        className="rounded-lg p-2 px-4 focus:outline-blue"
      />
      {error && <span className="text-red">{error}</span>}
    </div>
  );
}
