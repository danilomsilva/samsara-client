import LinkButton from '~/components/LinkButton';
import Add from '~/components/icons/Add';

export default function Usuario() {
  return (
    <div className="flex justify-between items-end">
      <h1 className="font-semibold">Lista de Usuários</h1>
      <div className="flex gap-4">
        <LinkButton to="" className="bg-blue" icon={<Add />}>
          Adicionar
        </LinkButton>
      </div>
    </div>
  );
}
