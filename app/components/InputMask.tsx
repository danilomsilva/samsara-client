import { useEffect, useState } from 'react';
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
  mask: string;
  onChange?: (value: string) => void;
};

export default function InputMask({
  name,
  label,
  className,
  type,
  disabled,
  value,
  autoFocus,
  error,
  mask,
  onChange,
}: PropTypes) {
  const [inputValue, setInputValue] = useState(value);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleBlur = () => {
    const cleanInputValue = inputValue?.replaceAll('/', '').replaceAll('_', '');

    if (cleanInputValue && cleanInputValue.length === 8) {
      setInputError('');
    } else {
      setInputError('Campo obrigatório');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

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
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        onChange={handleInputChange}
        onBlur={handleBlur}
      />
      {(error || inputError) && <ErrorMessage error={error || inputError} />}
    </div>
  );
}
