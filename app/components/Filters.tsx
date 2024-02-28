import { useState, type ChangeEvent } from 'react';
import InfoIcon from './icons/InfoIcon';

type PropTypes = {
  column: string;
  activeFilters: { [key: string]: string };
  setActiveFilters: (filters: { [key: string]: string }) => void;
};

export default function Filters({
  column,
  activeFilters,
  setActiveFilters,
}: PropTypes) {
  const [filterValue, setFilterValue] = useState('');

  const handleFilterOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);

    const updatedFilters = { ...activeFilters };
    if (value) updatedFilters[column] = value;
    else delete updatedFilters[column];

    setActiveFilters(updatedFilters);
  };

  return (
    <div className="my-2 ml-1 relative">
      <input
        type="text"
        name={column}
        value={filterValue}
        placeholder={
          column === 'created' ||
          column === 'data_inicio' ||
          column === 'data_final_previsto'
            ? 'dd/mm/aaaa'
            : 'Pesquisar...'
        }
        onChange={handleFilterOnChange}
        className="w-full p-1 px-2 border border-grey/30 rounded-md outline-blue"
      />
      <div
        className="absolute top-[6px] right-2 cursor-default"
        title={
          column === 'created' ||
          column === 'data_inicio' ||
          column === 'data_final_previsto'
            ? 'Mostrará resultados a partir desta data'
            : 'Mostrará resultados que contenham este texto'
        }
      >
        <InfoIcon className="w-4 h-4 text-grey/50" />
      </div>
    </div>
  );
}
