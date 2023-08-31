import { Combobox } from '@headlessui/react';
import { useControlField, useField } from 'remix-validated-form';
import ChevronDownIcon from './icons/ChrevronDownIcon';
import type { Option } from '~/utils/consts';
import ErrorMessage from './ErrorMessage';
import { useState } from 'react';

type PropTypes = {
  name: string;
  options: Option[];
  label: string;
  className?: string;
};

export default function Select({ name, options, label, className }: PropTypes) {
  const { error, validate } = useField(name);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useControlField<Option>(name);

  const handleChange = (option: Option) => {
    setSelected(option);
    validate();
  };

  const filteredOptions = options.filter((option) =>
    option.displayName
      .toLowerCase()
      .split(' ')
      .join('')
      .includes(query.toLocaleLowerCase().split(' ').join(''))
  );

  return (
    <fieldset className="flex flex-col gap-1">
      <Combobox value={selected} onChange={handleChange} name={name}>
        <div className="relative text-sm">
          <div className="flex flex-col gap-1">
            <Combobox.Label className="ml-1 text-grey-dark">
              {label}
            </Combobox.Label>
            <div className="relative">
              <Combobox.Input
                className={`${className} w-full rounded-lg p-2 pr-10 focus:outline-blue`}
                displayValue={(option: Option) => option?.displayName}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="-"
              />
              <Combobox.Button className="absolute inset-y-0 right-1 flex items-center pr-2 w-fit translate-y-0.5">
                <ChevronDownIcon className="text-blue w-4 h-4" />
              </Combobox.Button>
            </div>
          </div>

          <Combobox.Options className="absolute mt-1 py-1 max-h-60 w-full overflow-auto rounded-md bg-white  shadow-lg">
            {filteredOptions.map((option: Option) => (
              <Combobox.Option
                key={option.name}
                className="relative py-1 px-2 flex items-center cursor-pointer hover:bg-grey-light "
                value={option}
              >
                {option.displayName}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox>
      {error && <ErrorMessage error={error} />}
    </fieldset>
  );
}
