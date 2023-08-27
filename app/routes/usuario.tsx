import { json, type V2_MetaFunction, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import DataTable from '~/components/DataTable';
import LinkButton from '~/components/LinkButton';
import Add from '~/components/icons/Add';
import { type Usuario, getUsuarios } from '~/models/usuarios.server';
import { getUserSession } from '~/session.server';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Usuario | Samsara' }];
};

export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  const searchParams = new URL(request.url).searchParams;
  const sortParam = searchParams.get('sort');
  const [sortColumn, order] = sortParam?.split(':') ?? [];
  const sortingBy =
    order && sortColumn ? `${order === 'asc' ? '+' : '-'}${sortColumn}` : null;

  if (userToken) {
    const usuarios = await getUsuarios(userToken, sortingBy);
    return json({ usuarios });
  }
  return json({});
}

export default function UsuarioPage() {
  const { usuarios }: { usuarios: Usuario } = useLoaderData();

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
          { name: 'created', displayName: 'Data de criação' },
          { name: 'codigo', displayName: 'Código' },
          { name: 'nome_completo', displayName: 'Nome completo' },
          { name: 'email', displayName: 'Email' },
          { name: 'tipo_acesso', displayName: 'Tipo de acesso' },
          { name: 'obra', displayName: 'Alocado à obra' },
        ]}
        rows={usuarios}
      />
    </>
  );
}
