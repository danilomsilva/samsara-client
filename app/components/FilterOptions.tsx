import { useEffect, useState } from 'react';
import ChevronDownIcon from './icons/ChrevronDownIcon';
import CheckIcon from './icons/CheckIcon';
import { Link, useLocation, useSearchParams } from '@remix-run/react';
import { type Obra } from '~/models/obra.server';
import CalendarIcon from './icons/CalendarIcon';
import InputMaskValue from './InputMaskValue';
import { checkDateValid } from '~/utils/utils';

type PropTypes = {
  obras: Obra[];
};

export default function FilterOptions({ obras }: PropTypes) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [error, setError] = useState({
    startDate: false,
    endDate: false,
    isGreater: false,
  });
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const isFilterInativo = filter === '(inativo=false)';
  const location = useLocation();

  console.log(error);

  useEffect(() => {
    setOpen(false);
  }, [filter]);

  useEffect(() => {
    setError({
      ...error,
      startDate: !checkDateValid(startDate) ? false : true,
    });
  }, [startDate, endDate]);

  const handleSetOnlyActiveItems = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (isFilterInativo) {
      newSearchParams.delete('filter');
    } else {
      newSearchParams.set('filter', '(inativo=false)');
    }
    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  // const handleFiltrar = () => {
  //   const newSearchParams = new URLSearchParams(searchParams);
  //   if (startDate && endDate) {
  //     newSearchParams.set(
  //       'filter',
  //       `(data_inicio>='${convertToReverseDate(
  //         startDate
  //       )}' && data_inicio<='${convertToReverseDate(endDate)}')`
  //     );
  //     return `${location.pathname}?${newSearchParams.toString()}`;
  //   } else {
  //     return '';
  //   }
  // };

  const handleChangeStartDate = (e: any) => {
    setStartDate(e?.target?.value);
  };

  const handleChangeEndDate = (e: any) => {
    setEndDate(e?.target?.value);
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
        <div className="absolute top-12 left-0 z-50 bg-orange shadow-lg rounded-lg pb-2 w-72">
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
                <InputMaskValue
                  mask="99/99/9999"
                  type="text"
                  name="startDate"
                  label="De:"
                  value={startDate}
                  onChange={handleChangeStartDate}
                  className="!w-32"
                  error={error.startDate ? 'Data inválida!' : ''}
                />
                <CalendarIcon className="w-5 h-5 absolute right-2 top-8" />
              </div>
              <div>
                <div className="relative">
                  <InputMaskValue
                    mask="99/99/9999"
                    type="text"
                    name="endDate"
                    label="De:"
                    value={endDate}
                    onChange={handleChangeEndDate}
                    className="!w-32"
                  />
                  <CalendarIcon className="w-5 h-5 absolute right-2 top-8" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pr-3 pt-2">
            {/* <LinkButton to={handleFiltrar()} variant="blue">
              Filtrar
            </LinkButton> */}
          </div>
        </div>
      )}
    </div>
  );
}
