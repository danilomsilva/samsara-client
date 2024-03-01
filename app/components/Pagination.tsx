import { type PaginationType } from '~/utils/consts';
import LinkButton from './LinkButton';
import DoubleLeftArrowIcon from './icons/DoubleLeftArrowIcon';
import DoubleRightArrowIcon from './icons/DoubleRightArrowIcon';
import { useLocation, useNavigate, useSearchParams } from '@remix-run/react';
import ListboxMenu from './ListboxMenu';
import { useEffect } from 'react';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';

export type PropTypes = {
  pagination: PaginationType;
};

export default function Pagination({ pagination }: PropTypes) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { page, perPage, totalItems, totalPages } = pagination;
  const { setSelectedRow } = useSelectRow() as UseSelectedRow;

  useEffect(() => {
    setSelectedRow('');
  }, [page, perPage]);

  const renderPaginationButtons = () => {
    // 1,2,3,4,5 (max 5)
    if (totalPages <= 5) {
      const newArray = Array.from(
        new Array(totalPages),
        (_, index) => index + 1
      );
      return newArray;
    }

    // ellipsis only before last page.
    if (totalPages > 5 && page < 4) {
      return [1, 2, 3, 4, 5, null, totalPages];
    }

    // ellipsis after 1st page, range , ellipsis before last page.
    if (totalPages > 5 && page >= 4 && totalPages - page > 2) {
      return [1, null, page - 1, page, page + 1, null, totalPages];
    }

    // ellipsis only after 1st page.
    if (totalPages - page <= 2) {
      return [
        1,
        null,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
  };

  const handleChangePage = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    return `${location.pathname}?${newSearchParams.toString()}`;
  };

  const goToPreviousPage = (value: number) => {
    const newPage = value === 1 ? value : value - 1;
    return handleChangePage(newPage);
  };

  const goToNextPage = (value: number) => {
    const newPage = value === totalPages ? value : value + 1;
    return handleChangePage(newPage);
  };

  const handleChangePerPage = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('perPage', value);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const calculateResultsPerPage = () => {
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, totalItems);
    return (
      <div className="text-xs">{`Exibindo ${start}-${end} de ${totalItems}`}</div>
    );
  };

  return (
    <div className="flex justify-between gap-1 items-center px-1 mt-2">
      <div className="flex justify-between gap-1 items-center">
        {calculateResultsPerPage()}
      </div>
      <div className="flex gap-2">
        <div className="flex gap-2 items-center">
          <p className="text-xs">Resultados por página:</p>
          <ListboxMenu
            handleChangePerPage={handleChangePerPage}
            perPage={perPage}
          />
        </div>
        <div className="flex gap-1">
          <LinkButton
            to={goToPreviousPage(page)}
            icon={<DoubleLeftArrowIcon />}
            variant="outlineNone"
            className={`${
              page === 1 ? 'opacity-50 pointer-events-none' : ''
            } !h-8 w-8`}
          />
          {renderPaginationButtons()?.map((item, index) => {
            if (item === null) {
              return <span key={index}>...</span>;
            }
            return (
              <LinkButton
                key={index}
                to={handleChangePage(item)}
                variant={item === page ? 'blue' : 'outlineNone'}
                className="!h-8 w-8"
              >
                {item}
              </LinkButton>
            );
          })}
          <LinkButton
            to={goToNextPage(page)}
            icon={<DoubleRightArrowIcon />}
            variant="outlineNone"
            className={`${
              page === totalPages ? 'opacity-50 pointer-events-none' : ''
            } !h-8 w-8`}
          />
        </div>
      </div>
    </div>
  );
}
