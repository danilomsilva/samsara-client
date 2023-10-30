import { type Usuario } from '~/models/usuario.server';
import { PairLabelValue } from './PairLabelValue';
import { type Equipamento } from '~/models/equipamento.server';

type PropTypes = {
  loggedInUser?: Usuario;
  equipamento?: Equipamento;
};

export default function FooterSummary({
  loggedInUser,
  equipamento,
}: PropTypes) {
  return (
    <div className="flex gap-16 -mt-1">
      <PairLabelValue label="Obra" value={loggedInUser?.obraX ?? ''} />
      <PairLabelValue
        label="Encarregado"
        value={loggedInUser?.nome_completo ?? ''}
      />
      {/* <PairLabelValue
        label={`${
          equipamento?.instrumento_medicao
            ? equipamento?.instrumento_medicao
            : 'IM'
        } Início`}
        value={IMInicio0 ?? '-'}
      />
      <PairLabelValue
        label={`${
          equipamento?.instrumento_medicao
            ? equipamento?.instrumento_medicao
            : 'IM'
        } Final`}
        value={IMFinal ?? '-'}
      />
      <PairLabelValue
        label="Total"
        value={
          IMInicio0 && IMFinal
            ? +IMFinal - +IMInicio0 > 0
              ? String(+IMFinal - +IMInicio0)
              : '-'
            : '-'
        }
      /> */}
    </div>
  );
}
