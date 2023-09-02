import { json, type V2_MetaFunction, type LoaderArgs } from '@remix-run/node';
import { Outlet, useLoaderData, useSearchParams } from '@remix-run/react';
import DataTable from '~/components/DataTable';
import LinkButton from '~/components/LinkButton';
import MinusCircleIcon from '~/components/icons/MinusCircleIcon';
import PencilIcon from '~/components/icons/PencilIcon';
import Add from '~/components/icons/PlusCircleIcon';
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
  const [searchParams] = useSearchParams();
  const { usuarios }: { usuarios: Usuario[] } = useLoaderData();
  const rowSelected = searchParams.get('selected');

  return (
    <>
      <div className="flex justify-between items-end">
        <h1 className="font-semibold">Lista de Usuários</h1>
        <div className="flex gap-4">
          {rowSelected ? (
            <>
              <LinkButton
                to={`./${rowSelected}`}
                variant="grey"
                icon={<PencilIcon className="h-4 w-4" />}
              >
                Editar
              </LinkButton>
              <LinkButton
                to={`.`}
                variant="red"
                icon={<MinusCircleIcon className="h-4 w-4" />}
              >
                Remover
              </LinkButton>
            </>
          ) : (
            <LinkButton to="./new" variant="blue" icon={<Add />}>
              Adicionar
            </LinkButton>
          )}
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
      <Outlet />
    </>
  );
}
