import { useField } from 'remix-validated-form';
import type { Option } from '~/utils/consts';
import ErrorMessage from './ErrorMessage';

type PropTypes = {
  label: string;
  name: string;
  options: Option[];
};

//TODO: replace by headless UI: https://codesandbox.io/s/multistep-form-in-remix-f9siim?file=/app/components/ApproverSelector.tsx:0-3934
export default function Select({ label, name, options }: PropTypes) {
  const { error } = useField(name);
  return (
    <div className="flex flex-col gap-1 w-full text-sm">
      <label htmlFor="tipo_acesso" className=" text-grey-dark ml-1">
        {label}
      </label>
      <div className="pr-3 pl-1.5 rounded-lg bg-white">
        <select name="tipo_acesso" className="p-2 w-full outline-none">
          <option value="-">Selecione</option>
          {options.map((tipo) => {
            return (
              <option key={tipo.name} value={tipo.name}>
                {tipo.displayName}
              </option>
            );
          })}
        </select>
      </div>
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
