import { useEffect, useState } from 'react';
import ChevronDownIcon from './icons/ChrevronDownIcon';
import CheckIcon from './icons/CheckIcon';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import CalendarIcon from './icons/CalendarIcon';
import InputMaskValue from './InputMaskValue';
import {
  checkDateValid,
  convertToReverseDate,
  isDateGreater,
} from '~/utils/utils';
import Button from './Button';
import XIcon from './icons/XIcon';

type PropTypes = {
  filterDateBy?: string;
};

export default function FilterOptions({ filterDateBy = 'created' }: PropTypes) {
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
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [filter]);

  useEffect(() => {
    if (startDate && endDate) {
      setError({
        isGreater: !isDateGreater(startDate, endDate),
        startDate: !checkDateValid(startDate),
        endDate: !checkDateValid(endDate),
      });
    }
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

  const handleNavigate = () => {
    if (startDate && endDate) {
      const newSearchParams = new URLSearchParams(searchParams);
      if (filter?.includes('inativo')) {
        newSearchParams.set(
          'filter',
          `(inativo=false&&${filterDateBy}>='${convertToReverseDate(
            startDate
          )}' && ${filterDateBy}<='${convertToReverseDate(endDate)}')`
        );
        navigate(`${location.pathname}?${newSearchParams.toString()}`);
      } else {
        newSearchParams.set(
          'filter',
          `(${filterDateBy}>='${convertToReverseDate(
            startDate
          )}' && ${filterDateBy}<='${convertToReverseDate(endDate)}')`
        );
        navigate(`${location.pathname}?${newSearchParams.toString()}`);
      }
    }
  };

  const handleLimpar = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('filter');
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const handleChangeStartDate = (e: any) => {
    setStartDate(e?.target?.value);
  };

  const handleChangeEndDate = (e: any) => {
    setEndDate(e?.target?.value);
  };

  return (
    <div className="flex flex-col relative">
      <div
        className={`${
          open ? 'border-2' : 'border'
        } bg-white border border-orange px-4 py-2 h-10 rounded-lg flex gap-2 items-center text-xs uppercase font-semibold cursor-pointer hover:bg-grey/10`}
        onClick={() => setOpen(!open)}
      >
        <p>Filtro</p>
        <ChevronDownIcon className="h-4 w-4 text-orange" />
      </div>
      {open && (
        <div className="absolute top-12 right-0 z-50 bg-white shadow-lg rounded-lg pb-2 w-72 border-2 border-orange">
          <Link
            to={handleSetOnlyActiveItems()}
            className="h-10 border-b border-orange px-3 py-2 hover:bg-grey/10 cursor-pointer flex justify-between items-center"
          >
            <p className="uppercase text-xs font-semibold">
              Apenas itens ativos
            </p>
            {filter?.includes('inativo') && (
              <CheckIcon className="h-5 w-5 text-orange" />
            )}
          </Link>
          <div className="px-3 py-2 flex flex-col gap-2 border-b border-orange">
            <p className="uppercase text-xs font-semibold">Período:</p>
            <div className="flex gap-2">
              <div className="relative">
                <InputMaskValue
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
                    type="text"
                    name="endDate"
                    label="Até:"
                    value={endDate}
                    onChange={handleChangeEndDate}
                    className="!w-32"
                    error={error.endDate ? 'Data inválida!' : ''}
                  />
                  <CalendarIcon className="w-5 h-5 absolute right-2 top-8" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between px-3 pt-2">
            <Button
              variant="blue"
              text="Limpar"
              icon={<XIcon className="h-5 w-5 text-white" />}
              onClick={handleLimpar}
            />
            <Button
              variant="blue"
              text="Filtrar"
              icon={<CalendarIcon className="h-5 w-5 text-white" />}
              disabled={error.isGreater}
              onClick={handleNavigate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
