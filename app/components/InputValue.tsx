import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import ErrorMessage from './ErrorMessage';
import classnames from 'classnames'; // You can use a library like classnames for managing classNames.

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
}: PropTypes) {
  const [inputValue, setInputValue] = useState(value || '');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    // Update inputValue when the value prop changes.
    setInputValue(value || '');
  }, [value]);

  const handleBlur = () => {
    if (inputValue.trim() === '') {
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

  const inputClasses = classnames(
    className,
    'flex flex-col gap-1 text-sm w-full'
  );

  return (
    <div className={inputClasses}>
      <label
        htmlFor={name}
        className={`${
          labelBold && 'font-bold text-grey/90'
        } text-grey-dark ml-1`}
      >
        {noLabel ? null : label}
      </label>
      {type === 'currency' ? (
        <NumericFormat
          name={name}
          className="rounded-lg p-2 px-4 focus:outline-blue h-9"
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          allowNegative={false}
          fixedDecimalScale
          decimalScale={2}
          value={inputValue} // Use inputValue instead of value
        />
      ) : type === 'IM' ? (
        <NumericFormat
          name={name}
          className={classnames('rounded-lg p-2 px-4 focus:outline-blue h-9', {
            'border border-grey/50 bg-grey/10 pointer-events-none': disabled,
          })}
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          fixedDecimalScale
          decimalScale={0}
          value={inputValue} // Use inputValue instead of value
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
          className={classnames('rounded-lg p-2 px-4 focus:outline-blue h-9', {
            'border border-grey/50 bg-grey/10 pointer-events-none': disabled,
          })}
          value={inputValue} // Use inputValue instead of value
          autoFocus={autoFocus}
          autoComplete="off"
          onBlur={handleBlur}
          onChange={handleInputChange}
          readOnly={readOnly}
        />
      )}

      {(inputError || error) && (
        <ErrorMessage error={inputError || error || ''} />
      )}
    </div>
  );
}
