import React, { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import ErrorMessage from './ErrorMessage';

type PropTypes = {
  name: string;
  label: string;
  labelBold?: boolean;
  noLabel?: boolean;
  className?: string;
  type: 'text' | 'number' | 'password' | 'currency' | 'IM' | 'time';
  disabled?: boolean;
  value?: string;
  autoFocus?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  suffix?: string;
  readOnly?: boolean;
  tabIndex?: number;
};

export default function Input({
  name,
  labelBold,
  label,
  noLabel,
  className,
  type,
  disabled,
  value,
  autoFocus,
  error,
  onChange,
  suffix,
  readOnly,
  tabIndex,
}: PropTypes) {
  const [inputValue, setInputValue] = useState(value);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleBlur = () => {
    if (inputValue === '') {
      setInputError('Campo obrigatório');
    } else {
      setInputError('');
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
      <label
        htmlFor={name}
        className={`${
          labelBold && 'font-bold text-grey/90'
        } text-grey-dark ml-1`}
      >
        {noLabel ? null : label}
      </label>
      {type === 'IM' ? (
        <NumericFormat
          name={name}
          className={`${
            disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
          } rounded-lg p-2 px-4 focus:outline-blue h-9`}
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          fixedDecimalScale
          decimalScale={0}
          value={value}
          suffix={suffix}
          readOnly={readOnly}
          onBlur={handleBlur}
          onChange={handleInputChange}
        />
      ) : (
        <input
          name={name}
          type={type}
          min={1}
          className={`${
            disabled && 'border border-grey/50 bg-grey/10 pointer-events-none'
          } rounded-lg p-2 px-4 focus:outline-blue h-9`}
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          onBlur={handleBlur}
          onChange={handleInputChange}
          readOnly={readOnly}
          tabIndex={tabIndex}
        />
      )}

      {(inputError || error) && (
        <ErrorMessage error={inputError || error || ''} />
      )}
    </div>
  );
}
