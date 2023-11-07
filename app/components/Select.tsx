import { Combobox } from '@headlessui/react';
import ChevronDownIcon from './icons/ChrevronDownIcon';
import type { Option } from '~/utils/consts';
import ErrorMessage from './ErrorMessage';
import { useEffect, useState } from 'react';
import { normalizeString } from '~/utils/utils';

type PropTypes = {
  name: string;
  options: Option[];
  labelBold?: boolean;
  label: string;
  noLabel?: boolean;
  className?: string;
  placeholder?: string;
  error?: string;
  defaultValue?: string;
  onChange?: (option: Option) => void;
  disabled?: boolean;
};

export default function Select({
  name,
  options,
  labelBold,
  label,
  noLabel,
  className,
  placeholder,
  error,
  defaultValue,
  onChange,
  disabled,
}: PropTypes) {
  const [selected, setSelected] = useState<Option | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const optionObj = options?.find((option) => option.name === defaultValue);
    setSelected(optionObj as Option);
  }, []);

  const handleChange = (option: Option) => {
    setSelected(option);
    onChange && onChange(option);
  };

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          normalizeString(option.displayName).includes(normalizeString(query))
        );

  return (
    <fieldset className={`${className} flex flex-col gap-1 w-full`}>
      {/* hidden input only way to send id to backend */}
      <input type="hidden" name={name} value={selected?.name} />
      <Combobox onChange={handleChange} name={name} disabled={disabled}>
        <div className="relative text-sm">
          <div className="flex flex-col gap-1">
            <Combobox.Label
              className={`${
                labelBold && 'font-bold text-grey/90'
              } ml-1 text-grey-dark`}
            >
              {noLabel ? null : label}
            </Combobox.Label>
            <div className="relative">
              <Combobox.Input
                className={`${className} w-full rounded-lg p-2 px-4 pr-10 focus:outline-blue ${
                  disabled &&
                  'border border-grey/50 bg-grey/10 pointer-events-none'
                }`}
                displayValue={(option: Option) =>
                  defaultValue ? defaultValue : option.displayName
                }
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelected(null);
                }}
                placeholder={placeholder}
                value={selected?.displayName || query}
              />
              <Combobox.Button className="absolute inset-y-0 right-1 flex items-center pr-2 w-fit translate-y-0.5">
                <ChevronDownIcon className="text-blue w-4 h-4" />
              </Combobox.Button>
            </div>
          </div>

          <Combobox.Options className="absolute mt-1 py-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg z-50 scrollbar-thin scrollbar-thumb-grey/30 scrollbar-thumb-rounded">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-1 px-2">
                Nenhum resultado!
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="relative cursor-default select-none py-1 px-2">
                Nenhuma opção disponível!
              </div>
            ) : (
              filteredOptions.map((option: Option) => {
                return (
                  <Combobox.Option
                    key={option.name}
                    className={({ active }) =>
                      `${
                        active && 'bg-grey-light'
                      } relative py-1 px-4 flex items-center cursor-pointer`
                    }
                    value={option}
                  >
                    {option.displayName}
                  </Combobox.Option>
                );
              })
            )}
          </Combobox.Options>
        </div>
      </Combobox>
      {error && <ErrorMessage error={error} />}
    </fieldset>
  );
}
