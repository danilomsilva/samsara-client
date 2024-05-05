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
  const [createdAtEnd, setCreatedAtEnd] = useState('');

  const handleFilterOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);

    const updatedFilters = { ...activeFilters };
    if (value) updatedFilters[column] = value;
    else delete updatedFilters[column];

    setActiveFilters(updatedFilters);
  };

  const handleFilterOnChangeEnd = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreatedAtEnd(value);

    const updatedFilters = { ...activeFilters };
    if (value) updatedFilters['createdAtEnd'] = value;
    else delete updatedFilters['createdAtEnd'];

    setActiveFilters(updatedFilters);
  };

  const handleClearFilter = () => {
    setFilterValue('');
    setCreatedAtEnd('');
    const updatedFilters = { ...activeFilters };
    delete updatedFilters[column];
    delete updatedFilters['createdAtEnd'];
    setActiveFilters(updatedFilters);
  };

  return (
    <div className="my-2 ml-1 min-w-[110px]">
      <div className="flex gap-1 relative">
        <input
          type="text"
          name={column}
          value={filterValue}
          placeholder={
            column === 'created' ||
            column === 'data_inicio' ||
            column === 'data_final_previsto'
              ? 'De: dd/mm/aaaa'
              : 'Pesquisar...'
          }
          onChange={handleFilterOnChange}
          className={`${
            column === 'created' ? 'min-w-[150px] w-full' : 'w-full'
          } p-1 px-2 border border-grey/30 rounded-md outline-blue`}
        />
        <div
          className="absolute top-[6px] right-2 cursor-default"
          title={
            filterValue.length > 0
              ? ''
              : column === 'created'
              ? 'Selecione um período'
              : column === 'data_inicio' ||
                column === 'data_final_previsto' ||
                column === 'data_boletim'
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
        {column === 'created' && (
          <input
            type="text"
            name="created_end"
            value={createdAtEnd}
            placeholder="Até: dd/mm/aaaa"
            onChange={handleFilterOnChangeEnd}
            className="min-w-[150px] w-full p-1 px-2 border border-grey/30 rounded-md outline-blue"
          />
        )}
      </div>
    </div>
  );
}
