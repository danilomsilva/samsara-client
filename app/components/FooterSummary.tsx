import { type Usuario } from '~/models/usuario.server';
import { PairLabelValue } from './PairLabelValue';
import { type Equipamento } from '~/models/equipamento.server';
import { type Boletim } from '~/models/boletim.server';
import { convertNumberIntoStringWithComma } from '~/utils/utils';

type PropTypes = {
  boletim: Boletim;
  loggedInUser?: Usuario;
  equipamento?: Equipamento;
  firstHour?: string;
  lastHour?: string;
  IMInicio?: string;
  IMFinal?: string;
};

export default function FooterSummary({
  boletim,
  loggedInUser,
  equipamento,
  firstHour,
  lastHour,
  IMInicio,
  IMFinal,
}: PropTypes) {
  const suffix = equipamento?.instrumento_medicao
    ? equipamento?.instrumento_medicao === 'Odômetro'
      ? 'km'
      : 'h'
    : '';

  return (
    <div className="flex gap-10 -mt-1">
      {boletim && (
        <PairLabelValue label="Boletim" value={boletim?.codigo ?? ''} />
      )}
      <PairLabelValue
        label="Obra"
        value={boletim ? boletim?.obraX : loggedInUser?.obraX}
      />
      <PairLabelValue
        label="Encarregado"
        value={boletim ? boletim?.encarregadoX : loggedInUser?.nome_completo}
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
        value={`${
          (IMInicio && convertNumberIntoStringWithComma(IMInicio)) || '-'
        } / ${
          (IMFinal && convertNumberIntoStringWithComma(IMFinal)) || '-'
        } ${suffix}`}
      />
      <PairLabelValue
        label={`${
          equipamento?.instrumento_medicao
            ? equipamento?.instrumento_medicao
            : 'IM'
        } Total`}
        value={
          IMInicio && IMFinal
            ? `${
                IMInicio &&
                IMFinal &&
                convertNumberIntoStringWithComma(
                  (Number(IMFinal) - Number(IMInicio)).toFixed(2)
                )
              } ${suffix}`
            : '-'
        }
        tooltip={
          equipamento?.instrumento_medicao === 'Horímetro' &&
          !!(IMInicio && IMFinal && Number(IMFinal) - Number(IMInicio) > 9)
        }
      />
    </div>
  );
}
