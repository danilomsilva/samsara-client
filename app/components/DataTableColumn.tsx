import { Link, useLocation } from '@remix-run/react';
import ChrevronDownIcon from './icons/ChrevronDownIcon';
import clsx from 'clsx';

type PropTypes = {
  children: string;
  column: string;
};

export default function Column({ column, children }: PropTypes) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const currentSort = searchParams.get('sort');

  if (currentSort === `${column}:asc`) {
    searchParams.set('sort', `${column}:desc`);
  } else if (currentSort === `${column}:desc`) {
    searchParams.set('sort', '');
  } else {
    searchParams.set('sort', `${column}:asc`);
  }

  return (
    <th className="pl-4 font-semibold cursor-pointer truncate">
      <Link
        to={{ pathname: location.pathname, search: searchParams.toString() }}
      >
        <div className="flex items-center gap-2 group">
          {children}
          <ChrevronDownIcon
            className={clsx(
              {
                'rotate-180': currentSort === `${column}:desc`,
              },
              {
                'opacity-0 group-hover:opacity-50':
                  !currentSort?.includes(`${column}`) || !currentSort,
              },
              'h-3.5 w-3.5'
            )}
          />
        </div>
      </Link>
    </th>
  );
}
