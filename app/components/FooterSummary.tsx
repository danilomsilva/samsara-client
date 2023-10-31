import { type Usuario } from '~/models/usuario.server';
import { PairLabelValue } from './PairLabelValue';
import { type Equipamento } from '~/models/equipamento.server';

type PropTypes = {
  loggedInUser?: Usuario;
  equipamento?: Equipamento;
  firstHour?: string;
  lastHour?: string;
  IMInicio?: string;
  IMFinal?: string;
};

export default function FooterSummary({
  loggedInUser,
  equipamento,
  firstHour,
  lastHour,
  IMInicio,
  IMFinal,
}: PropTypes) {
  return (
    <div className="flex gap-10 -mt-1">
      <PairLabelValue label="Obra" value={loggedInUser?.obraX ?? ''} />
      <PairLabelValue
        label="Encarregado"
        value={loggedInUser?.nome_completo ?? ''}
      />
      <PairLabelValue
        label="Horário"
        value={`${firstHour ?? '-'} / ${lastHour ?? '-'}`}
      />
      <PairLabelValue
        label={`${
          equipamento?.instrumento_medicao
            ? equipamento?.instrumento_medicao
            : 'IM'
        } `}
        value={`${IMInicio ?? '-'} / ${IMFinal ?? '-'}`}
      />
      <PairLabelValue
        label={`${
          equipamento?.instrumento_medicao
            ? equipamento?.instrumento_medicao
            : 'IM'
        } Total`}
        value={
          IMInicio && IMFinal ? String(Number(IMFinal) - Number(IMInicio)) : '-'
        }
      />
    </div>
  );
}
