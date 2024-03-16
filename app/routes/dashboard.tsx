import {
  type ActionArgs,
  type LoaderArgs,
  redirect,
  json,
  type V2_MetaFunction,
} from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { getBoletins } from '~/models/boletim.server';
import { getEquipamentos } from '~/models/equipamento.server';
import { getManutencoes } from '~/models/manutencao.server';
import { getMultas } from '~/models/multa.server';
import { getObras } from '~/models/obra.server';
import { getOperadores } from '~/models/operador.server';
import { getUsuarios } from '~/models/usuario.server';
import { getUserSession, logout } from '~/session.server';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Dashboard | Samsara' }];
};

// if user token do not exists in cookies, will redirect to login
export async function loader({ request }: LoaderArgs) {
  const { userToken } = await getUserSession(request);
  if (!userToken) return redirect('/login');

  const boletins = await getBoletins(userToken, '');
  const totalBoletins = boletins.totalItems;

  const equipamentos = await getEquipamentos(userToken, '');
  const totalEquipamentos = equipamentos.totalItems;

  const manutencoes = await getManutencoes(userToken, '');
  const totalManutencoes = manutencoes.totalItems;

  const multas = await getMultas(userToken, '');
  const totalmultas = multas.totalItems;

  const obras = await getObras(userToken, '');
  const totalObras = obras.totalItems;

  const operadores = await getOperadores(userToken, '');
  const totalOperadores = operadores.totalItems;

  const usuarios = await getUsuarios(userToken, '');
  const totalUsuarios = usuarios.totalItems;

  return json({
    totalBoletins,
    totalEquipamentos,
    totalManutencoes,
    totalObras,
    totalmultas,
    totalOperadores,
    totalUsuarios,
  });
}

// will destroy cookie session and logout user
export async function action({ request }: ActionArgs) {
  return await logout(request);
}

export default function Dashboard() {
  const {
    totalBoletins,
    totalEquipamentos,
    totalManutencoes,
    totalmultas,
    totalObras,
    totalOperadores,
    totalUsuarios,
  } = useLoaderData<typeof loader>();
  return (
    <main className="flex gap-6 flex-wrap">
      <StatCard title="OBRAS" value={totalObras} />
      <StatCard title="EQUIPAMENTOS" value={totalEquipamentos} />
      <StatCard title="OPERADORES" value={totalOperadores} />
      <StatCard title="USUÁRIOS" value={totalUsuarios} />
      <StatCard title="BOLETINS" value={totalBoletins} />
      <StatCard title="MANUTENÇÕES" value={totalManutencoes} />
      <StatCard title="MULTAS" value={totalmultas} />
    </main>
  );
}

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white flex flex-col gap-4 min-w-44 pb-8 pt-6 px-12 rounded-lg shadow-lg items-center">
    <h1 className="text-grey font-semibold">{title}</h1>
    <p className="text-5xl">{value}</p>
  </div>
);
