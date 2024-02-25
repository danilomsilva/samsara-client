import { Menu } from '@headlessui/react';
import { type ColumnType } from './DataTable';
import ChevronDownIcon from './icons/ChrevronDownIcon';
import InputMaskValue from './InputMaskValue';
import { useEffect, useState } from 'react';
import {
  checkDateValid,
  convertToReverseDate,
  isDateGreater,
} from '~/utils/utils';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import Input from './Input';
import ArrowRightIcon from './icons/ArrowRightIcon';
import XIcon from './icons/XIcon';

export default function FilterOptions2({ columns }: { columns: ColumnType[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [error, setError] = useState({
    startDate: false,
    endDate: false,
    isGreater: false,
  });
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const filterParam = searchParams.get('filter');

  useEffect(() => {
    if (startDate && endDate) {
      setError({
        isGreater: !isDateGreater(startDate, endDate),
        startDate: !checkDateValid(startDate),
        endDate: !checkDateValid(endDate),
      });
    }
  }, [startDate, endDate]);

  const handleChangeStartDate = (e: any) => {
    setStartDate(e?.target?.value);
  };

  const handleChangeEndDate = (e: any) => {
    setEndDate(e?.target?.value);
  };

  const handleShowOnlyAtivos = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (filterParam?.includes('inativo')) {
      newSearchParams.delete('filter');
    } else {
      newSearchParams.set('filter', '(inativo=false)');
    }
    return `?${newSearchParams.toString()}`;
  };

  const handleNavigate = () => {
    if (startDate && endDate) {
      const newSearchParams = new URLSearchParams(searchParams);
      if (filterParam?.includes('inativo')) {
        newSearchParams.set(
          'filter',
          `(inativo=false&&created>='${convertToReverseDate(
            startDate
          )}'&&created<='${convertToReverseDate(endDate)}')`
        );
        navigate(`${location.pathname}?${newSearchParams.toString()}`);
      } else {
        newSearchParams.set(
          'filter',
          `(created>='${convertToReverseDate(
            startDate
          )}'&&created<='${convertToReverseDate(endDate)}')`
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

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className="flex rounded-lg justify-center h-10 px-4 items-center bg-white font-semibold uppercase text-xs gap-2 text-blue hover:bg-grey/10"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        Filtro
        <ChevronDownIcon className="h-4 w-4 text-orange" />
      </Menu.Button>

      {menuOpen && (
        <>
          <Menu.Items
            className="absolute bg-blue z-50 mt-1 rounded-lg flex flex-col text-white w-[480px] shadow-lg divide-y divide-grey/30 overflow-hidden right-0"
            static
          >
            <Link
              className="hover:bg-blue-light font-semibold text-sm cursor-pointer gap-2 p-2 hover:text-white "
              to={handleShowOnlyAtivos()}
            >
              Apenas itens ativos
            </Link>
            {columns.map((column) => (
              <Menu.Item
                key={column.key}
                className="hover:bg-blue-light font-semibold text-sm cursor-pointer gap-2 px-3 py-2 hover:text-white flex justify-between items-center"
                as="div"
              >
                {column.label}
                {column.key === 'created' ? (
                  <div className="flex gap-3 items-center">
                    <InputMaskValue
                      type="text"
                      name="startDate"
                      label="De:"
                      value={startDate}
                      onChange={handleChangeStartDate}
                      className="!w-28"
                      error={error.startDate ? 'Data inválida!' : ''}
                    />
                    <InputMaskValue
                      type="text"
                      name="endDate"
                      label="Até:"
                      value={endDate}
                      onChange={handleChangeEndDate}
                      className="!w-28"
                      error={error.endDate ? 'Data inválida!' : ''}
                    />
                    <div className="flex gap-1">
                      <div
                        className="bg-white w-7 h-7 flex items-center justify-center mt-4 rounded cursor-pointer"
                        onClick={handleLimpar}
                      >
                        <XIcon className="h-4 w-4 text-orange" />
                      </div>
                      <div
                        className="bg-white w-7 h-7 flex items-center justify-center mt-4 rounded cursor-pointer"
                        onClick={handleNavigate}
                      >
                        <ArrowRightIcon className="h-4 w-4 text-orange" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-center">
                    <Input
                      type="text"
                      name="filter"
                      label=""
                      className="!w-[238px]"
                    />
                    <div className="flex gap-1">
                      <div
                        className="bg-white w-7 h-7 flex items-center justify-center mt-1 rounded cursor-pointer"
                        onClick={handleLimpar}
                      >
                        <XIcon className="h-4 w-4 text-orange" />
                      </div>
                      <div
                        className="bg-white w-7 h-7 flex items-center justify-center mt-1 rounded cursor-pointer"
                        onClick={handleNavigate}
                      >
                        <ArrowRightIcon className="h-4 w-4 text-orange" />
                      </div>
                    </div>
                  </div>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </>
      )}
    </Menu>
  );
}
