export function PairLabelValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p>{label}</p>
      <p className="font-bold leading-tight">{value}</p>
    </div>
  );
}
