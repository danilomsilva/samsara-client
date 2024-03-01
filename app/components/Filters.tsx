import { useState, type ChangeEvent } from 'react';
import InfoIcon from './icons/InfoIcon';
import XIcon from './icons/XIcon';

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

  const handleClearFilter = () => {
    setFilterValue('');
    const updatedFilters = { ...activeFilters };
    delete updatedFilters[column];
    setActiveFilters(updatedFilters);
  };

  return (
    <div className="my-2 ml-1 relative min-w-[110px]">
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
          filterValue.length > 0
            ? ''
            : column === 'created' ||
              column === 'data_inicio' ||
              column === 'data_final_previsto'
            ? 'A partir de'
            : column === 'instrumento_medicao_inicio' ||
              column === 'instrumento_medicao_atual' ||
              column === 'proxima_revisao' ||
              column === 'revisao_status' ||
              column === 'IM_atual'
            ? 'Maior ou Igual a'
            : 'Contém'
        }
      >
        {filterValue.length > 0 ? (
          <div
            onClick={handleClearFilter}
            className="bg-grey-light rounded-full mt-px cursor-pointer"
          >
            <XIcon className="w-3.5 h-3.5 text-grey/50" />
          </div>
        ) : (
          <InfoIcon className="w-4 h-4 text-grey/50" />
        )}
      </div>
    </div>
  );
}
