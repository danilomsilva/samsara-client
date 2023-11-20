import { useEffect, useState } from 'react';
import ChevronDownIcon from './icons/ChrevronDownIcon';
import CheckIcon from './icons/CheckIcon';
import Button from './Button';
import { Link, useLocation, useSearchParams } from '@remix-run/react';

export default function FilterOptions() {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const isFilterInativo = filter === '(inativo=false)';
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [filter]);

  const handleSetOnlyActiveItems = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (isFilterInativo) {
      newSearchParams.delete('filter');
    } else {
      newSearchParams.set('filter', '(inativo=false)');
    }
    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  return (
    <div className="flex flex-col relative">
      <div
        className="bg-white border border-orange px-4 py-2 h-10 rounded-lg flex gap-2 items-center text-xs uppercase font-semibold cursor-pointer hover:bg-grey/10"
        onClick={() => setOpen(!open)}
      >
        <p>Filtro</p>
        <ChevronDownIcon className="h-4 w-4 text-orange" />
      </div>
      {open && (
        <div className="absolute top-12 left-0 z-50 bg-orange shadow-lg rounded-lg pb-2">
          <Link
            to={handleSetOnlyActiveItems()}
            className="h-10 border-b border-grey/50 px-3 py-2 hover:bg-grey/10 cursor-pointer flex justify-between items-center"
          >
            <p className="uppercase text-xs font-semibold text-white">
              Apenas itens ativos
            </p>
            {filter === '(inativo=false)' && (
              <CheckIcon className="h-6 w-6 text-white" />
            )}
          </Link>
          <div className="px-3 py-2 flex flex-col gap-2 border-b border-grey/50">
            <p className="uppercase text-xs font-semibold text-white">
              Período:
            </p>
            <div className="flex gap-2">
              <input
                type="date"
                className="h-10 border border-orange rounded-lg px-3 py-2 text-xs"
              />
              <input
                type="date"
                className="h-10 border border-orange rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>
          {/* <div className="flex justify-end pr-3 pt-2">
            <Button
              text="Filtrar"
              variant="blue"
              icon={<CheckIcon className="h-5 w-5" />}
            />
          </div> */}
        </div>
      )}
    </div>
  );
}
