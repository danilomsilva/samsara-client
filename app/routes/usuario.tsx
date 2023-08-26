import DataTable from '~/components/DataTable';
import LinkButton from '~/components/LinkButton';
import Add from '~/components/icons/Add';

export default function Usuario() {
  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Usuários</h1>
        <div className="flex gap-4">
          <LinkButton to="" className="bg-blue" icon={<Add />}>
            Adicionar
          </LinkButton>
        </div>
      </div>
      <DataTable
        columns={[
          'Data de criação',
          'Código',
          'Nome completo',
          'Email',
          'Tipo de acesso',
          'Alocado à obra',
        ]}
        rows={[
          { name: 'Alfreds Futterkiste', country: 'Germany' },
          { name: 'Berglunds snabbkop', country: 'Sweden' },
          { name: 'Island Trading', country: 'UK' },
          { name: 'Koniglich Essen', country: 'Germany' },
          { name: 'Laughing Bacchus Winecellars', country: 'Canada' },
          { name: 'Magazzini Alimentari Riuniti', country: 'Italy' },
          { name: 'North/South', country: 'UK' },
          { name: 'Paris specialites', country: 'France' },
        ]}
      />
    </>
  );
}
