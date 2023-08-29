import ExclamationTriangle from './icons/ExclamationTriangle';

type PropTypes = {
  error: string;
};

export default function ErrorMessage({ error }: PropTypes) {
  return (
    <div className="flex gap-0.5 items-center ml-1">
      <ExclamationTriangle className="h-3 w-3 text-red" />
      <span className="text-red ml-1 text-xs">{error}</span>
    </div>
  );
}
