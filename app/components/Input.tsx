import { useField } from "remix-validated-form";

type PropTypes = {
  name: string;
  label: string;
};

export default function Input({ name, label }: PropTypes) {
  const { error, getInputProps } = useField(name);
  return (
    <div className="flex flex-col">
      <label htmlFor={name}>{label}</label>
      <input {...getInputProps({ id: name })} />
      {error && <span className="text-red">{error}</span>}
    </div>
  );
}
