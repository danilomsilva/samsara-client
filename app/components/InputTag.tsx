import { useEffect, useState } from 'react';
import PlusCircleIcon from './icons/PlusCircleIcon';
import ErrorMessage from './ErrorMessage';

type PropTypes = {
  name: string;
  label: string;
  className?: string;
  defaultValue?: string;
  error?: string;
  onChange?: (value: any) => void;
  placeholder?: string;
  data: any[];
};

export default function InputTag({
  name,
  defaultValue,
  onChange,
  placeholder,
  className,
  label,
  data,
}: PropTypes) {
  const [array, setArray] = useState<any[]>([]);
  const [value, setValue] = useState<string | undefined>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    onChange && onChange(array);
  }, [array]);

  const handleChange = (e: any) => {
    setError('');
    setValue(e.target.value);
  };

  const handleAddToArray = () => {
    const findEntry = data.find((item) => item.codigo.split('-')[1] === value);
    if (findEntry) {
      const findArray = array.find((item) => item.codigo === findEntry.codigo);
      if (findArray) {
        setError('Operação já adicionada');
      } else {
        setArray((prev) => [...prev, findEntry]);
        setValue('');
      }
    } else {
      setError('Operação não cadastrada!');
    }
  };

  const handleRemoveFromArray = (id: string) => {
    setArray((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={`${className} flex flex-col gap-1 text-sm w-full relative`}>
      <label htmlFor={name} className={`text-grey-dark ml-1`}>
        {label}
      </label>
      <input
        name={name}
        type="text"
        min={1}
        className="rounded-lg p-2 px-4 focus:outline-blue h-9"
        defaultValue={defaultValue}
        value={value}
        autoComplete="off"
        onChange={handleChange}
        placeholder={placeholder}
      />
      {error && <ErrorMessage error={error} />}
      {value && value?.length > 0 && !error && (
        <div className="absolute right-2 top-7  rounded-full cursor-pointer hover:bg-green/50 bg-green">
          <PlusCircleIcon
            className="h-7 w-7 text-white"
            onClick={handleAddToArray}
          />
        </div>
      )}
      <div className="flex gap-1 p-2">
        {array.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-grey/30 rounded-md text-[10px] gap-1 flex overflow-hidden items-center pl-1 !h-5"
            >
              {item.codigo}
              <div
                className="px-1 text-[13px] cursor-pointer hover:bg-grey/50"
                onClick={() => handleRemoveFromArray(item.id)}
              >
                x
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
