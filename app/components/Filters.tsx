import { useLocation, useNavigate, useSearchParams } from '@remix-run/react';
import { useState, type ChangeEvent, useEffect } from 'react';
import ExclamationTriangle from './icons/ExclamationTriangle';

type PropTypes = {
  column: string;
};

export default function Filters({ column }: PropTypes) {
  const [filterValue, setFilterValue] = useState('');
  const [error, setError] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  let timeoutId: any;

  useEffect(() => {
    handleKeyUp();
    return () => clearTimeout(timeoutId);
  }, [filterValue]);

  const handleKeyUp = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(handleFilterChange, 2000);
  };

  const handleFilterChange = () => {
    setError(false); // Reset error state on filter change
    const newSearchParams = new URLSearchParams(searchParams);
    const currentFilter = newSearchParams.get('filter');
    if (currentFilter?.includes(column)) {
      let splitFilter = currentFilter?.split('&&');
      splitFilter.forEach((element, index) => {
        if (element.includes(column)) {
          // replace the value for the column from (column~'value') to (column~'newValue')
          const valueStartIndex = element.indexOf(`'`) + 1;
          const valueEndIndex = element.lastIndexOf(`'`);
          const newValue = `${filterValue}`;
          const newElement =
            element.substring(0, valueStartIndex) +
            newValue +
            element.substring(valueEndIndex);
          splitFilter[index] = newElement;
          const reJoined = splitFilter.join('&&');
          newSearchParams.set('filter', `${reJoined}`);
          navigate(`${location.pathname}?${newSearchParams.toString()}`);
        }
      });
    } else {
      if (!currentFilter) {
        if (column === 'created') {
          newSearchParams.set('filter', `(${column}>'${filterValue}')`);
        } else {
          newSearchParams.set('filter', `(${column}~'${filterValue}')`);
        }
        navigate(`${location.pathname}?${newSearchParams.toString()}`);
      } else {
        let splitFilter = currentFilter?.split('&&');
        if (column === 'created') {
          splitFilter?.push(`(${column}>'${filterValue}')`);
        } else {
          splitFilter?.push(`(${column}~'${filterValue}')`);
        }
        const reJoined = splitFilter?.join('&&');
        newSearchParams.set('filter', `${reJoined}`);
        navigate(`${location.pathname}?${newSearchParams.toString()}`);
      }
    }
    const isValidDate = validateDate(filterValue); // Check for valid date format

    if (filterValue.length === 10 && column === 'created' && isValidDate) {
      const formattedDate = formatDate(filterValue); // Convert date format
      newSearchParams.set('filter', `(${column}>'${formattedDate}')`);
      navigate(`${location.pathname}?${newSearchParams.toString()}`);
    } else if (filterValue.length > 0) {
      setError(true);
    }
  };

  const validateDate = (dateString: string): boolean => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    return dateRegex.test(dateString);
  };

  const formatDate = (dateString: string): string => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleFilterOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  };

  return (
    <div className="my-2 ml-1 relative">
      <input
        type="text"
        name={column}
        value={filterValue}
        onChange={handleFilterOnChange}
        className="w-full p-1 px-2 border border-grey/30 rounded-md outline-blue"
      />
      {column === 'created' && error && (
        <ExclamationTriangle className="w-4 h-4 text-red absolute top-2 right-2" />
      )}
    </div>
  );
}
