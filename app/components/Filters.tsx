import { useNavigate, useSearchParams } from '@remix-run/react';
import { useState, type ChangeEvent, useEffect } from 'react';

type PropTypes = {
  column: string;
};

export default function Filters({ column }: PropTypes) {
  const [filterValue, setFilterValue] = useState('');
  const [searchParams] = useSearchParams();
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

  // add or update the filter in the URL
  const handleFilterChange = () => {
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
        newSearchParams.set('filter', `(${column}~'${filterValue}')`);
        navigate(`${location.pathname}?${newSearchParams.toString()}`);
      } else {
        let splitFilter = currentFilter?.split('&&');
        splitFilter?.push(`(${column}~'${filterValue}')`);
        const reJoined = splitFilter?.join('&&');
        newSearchParams.set('filter', `${reJoined}`);
        navigate(`${location.pathname}?${newSearchParams.toString()}`);
      }
    }
  };

  const handleFilterOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  };

  return (
    <div className="my-2 ml-1">
      <input
        type="text"
        name={column}
        value={filterValue}
        onChange={handleFilterOnChange}
        className="w-full p-1 px-2 border border-grey/30 rounded-md outline-blue"
      />
    </div>
  );
}
