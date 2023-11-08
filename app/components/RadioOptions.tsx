import { type Option } from '~/utils/consts';

export type PropTypes = {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string;
  disabled?: boolean;
};

export default function RadioOptions({
  name,
  label,
  options,
  defaultValue,
  disabled,
}: PropTypes) {
  return (
    <div className="flex flex-col text-sm gap-2 text-grey-dark ml-1 mb-4">
      <label>{label}</label>
      <div className="flex gap-4">
        {options.map((option) => (
          <div key={option.name} className="flex items-center">
            <input
              id={name}
              name={name}
              type="radio"
              value={option.displayName}
              defaultChecked={
                defaultValue
                  ? option.name === defaultValue
                  : option.name === 'Simples'
              }
              className="h-4 w-4 hover:cursor-pointer"
              disabled={disabled}
            />
            <label htmlFor={name} className="ml-2 mb-px pointer-events-none">
              {option.displayName}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
