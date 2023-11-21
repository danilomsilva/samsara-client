import { useEffect, useState } from 'react';
import ChevronDownIcon from './icons/ChrevronDownIcon';
import CheckIcon from './icons/CheckIcon';
import { Link, useLocation, useSearchParams } from '@remix-run/react';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { type Obra } from '~/models/obra.server';
import CalendarIcon from './icons/CalendarIcon';
registerLocale('pt-br', ptBR);

type PropTypes = {
  obras: Obra[];
};

export default function FilterOptions({ obras }: PropTypes) {
  const [open, setOpen] = useState(false);
  const [periodoInicio, setPeriodoInicio] = useState();
  const [periodoFinal, setPeriodoFinal] = useState(new Date());
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

  const handlePeriodoEndChange = (e) => {
    setPeriodoFinal(e);
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
            className="h-10 border-b border-white px-3 py-2 hover:bg-grey/10 cursor-pointer flex justify-between items-center"
          >
            <p className="uppercase text-xs font-semibold text-white">
              Apenas itens ativos
            </p>
            {filter === '(inativo=false)' && (
              <CheckIcon className="h-6 w-6 text-white" />
            )}
          </Link>
          <div className="px-3 py-2 flex flex-col gap-2 border-b border-white">
            <p className="uppercase text-xs font-semibold text-white">
              Período:
            </p>
            <div className="flex gap-2">
              <div className="relative">
                <DatePicker
                  locale="pt-br"
                  selected={new Date()}
                  onChange={handlePeriodoEndChange}
                  className="h-10 border border-orange rounded-lg px-3 py-2 text-xs"
                />
                <CalendarIcon className="absolute right-2 h-5 w-5 top-2" />
              </div>
              <div className="relative">
                <DatePicker
                  locale="pt-br"
                  selected={new Date()}
                  onChange={handlePeriodoEndChange}
                  className="h-10 border border-orange rounded-lg px-3 py-2 text-xs"
                />
                <CalendarIcon className="absolute right-2 h-5 w-5 top-2" />
              </div>
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
