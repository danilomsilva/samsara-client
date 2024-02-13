import Tooltip from './Tooltip';

export function PairLabelValue({
  label,
  value,
  tooltip,
}: {
  label?: string;
  value?: string;
  tooltip?: boolean;
}) {
  return tooltip ? (
    <Tooltip
      contentClassName="w-[470px] z-50 text-white font-semibold shadow-md"
      content={
        <>
          <p>Quantidade de horas acima do normal (9h / dia)</p>
          <p>Revise os valores de IM inseridos acima antes de Concluir.</p>
        </>
      }
    >
      <div className="bg-orange text-white rounded py-1 px-2 cursor-default">
        <p>{label}</p>
        <p className="font-bold leading-tight">{value}</p>
      </div>
    </Tooltip>
  ) : (
    <div>
      <p>{label}</p>
      <p className="font-bold leading-tight">{value}</p>
    </div>
  );
}
