import { useState } from 'react';

export type PropTypes = {
  name: string;
  label: string;
  onChange?: (value: boolean) => void;
  value?: boolean;
};

export default function Checkbox({ name, label, onChange, value }: PropTypes) {
  const [isChecked, setIsChecked] = useState(value);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    onChange && onChange(!isChecked);
  };

  return (
    <div className="flex flex-col ml-1 mt-4 gap-1">
      <label htmlFor={name} className="text-grey-dark text-sm">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        className="h-6 w-6 accent-blue hover:accent-grey cursor-pointer"
      />
    </div>
  );
}
