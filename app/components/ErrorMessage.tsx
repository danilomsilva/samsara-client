import ExclamationTriangle from './icons/ExclamationTriangle';

type PropTypes = {
  error: string;
};

export default function ErrorMessage({ error }: PropTypes) {
  return (
    <div className="flex gap-0.5 ml-1">
      <div>
        <ExclamationTriangle className="h-3 w-3 text-red mt-1" />
      </div>
      <span className="text-red ml-1 text-xs">{error}</span>
    </div>
  );
}
