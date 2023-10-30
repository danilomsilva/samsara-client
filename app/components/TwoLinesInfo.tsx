import { type Operacao } from '~/models/operacao.server';
import InfoCircleIcon from './icons/InfoCircleIcon';
import { type OS } from '~/models/ordem-servico.server';

type PropTypes = {
  OS: OS;
  OP: Operacao;
};

export default function TwoLinesInfo({ OP, OS }: PropTypes) {
  return (
    <div className="p-2 flex flex-col gap-2 mt-3 text-sm h-14">
      <div className="flex gap-2 ">
        {(OS || OP) && <InfoCircleIcon className="h-6 w-6 text-orange" />}
        <div>
          <p>
            {OS && (
              <>
                <span className="font-bold">{OS?.codigo}</span>
                <span> - </span>
                <span>{OS?.descricao}</span>
              </>
            )}
          </p>
          <p>
            {OP && (
              <>
                <span className="font-bold">{OP?.codigo}</span>
                <span> - </span>
                <span>{OP?.descricao}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
