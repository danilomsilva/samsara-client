import { type PaginationType } from '~/utils/consts';
import LinkButton from './LinkButton';
import DoubleLeftArrowIcon from './icons/DoubleLeftArrowIcon';
import DoubleRightArrowIcon from './icons/DoubleRightArrowIcon';

export type PropTypes = {
  pagination: PaginationType;
};

export default function Pagination({ pagination }: PropTypes) {
  return (
    <div className="flex justify-end gap-1">
      <LinkButton
        to="#"
        icon={<DoubleLeftArrowIcon />}
        variant="blue"
        className="h-8 w-8"
      />
      <LinkButton to="#" variant="blue" className="h-8 w-8">
        1
      </LinkButton>
      <LinkButton to="#" variant="blue" className="h-8 w-8">
        2
      </LinkButton>
      <LinkButton to="#" variant="blue" className="h-8 w-8">
        3
      </LinkButton>
      <LinkButton
        to="#"
        icon={<DoubleRightArrowIcon />}
        variant="blue"
        className="h-8 w-8"
      />
    </div>
  );
}
