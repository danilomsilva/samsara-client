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

  const handleFilterChange = () => {
    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.set('filter', `(${column}~'${filterValue}')`);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
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
        onKeyUp={handleKeyUp}
        className="w-full p-1 px-2 border border-grey/30 rounded-md outline-blue"
      />
    </div>
  );
}
