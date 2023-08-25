import { NavLink } from '@remix-run/react';
import type { ReactNode } from 'react';

export default function SideMenu({ children }: { children: ReactNode }) {
  return (
    <div className="bg-grey-light h-screen flex">
      <div className="bg-white h-screen w-[250px] px-6 py-8 gap-8 flex flex-col">
        <div className="flex flex-col items-center gap-2">
          <img src="/assets/logo.png" alt="logo" width={60} height={60} />
          <h1 className="font-semibold">Olá, usuário!</h1>
        </div>
        <div className="border-grey-light border-t flex flex-col gap-2">
          <h2 className="uppercase text-xs font-semibold mt-2">Dashboard</h2>
          <div className="ml-3 flex flex-col gap-1">
            <NavItem to="/dashboard" text="Dashboard" />
          </div>
        </div>
        <div className="border-grey-light border-t flex flex-col gap-2 flex-1">
          <h2 className="uppercase text-xs font-semibold mt-2">
            Gerenciamento
          </h2>
          <div className="ml-3 flex flex-col gap-2 ">
            <NavItem to="/obra" text="Obra" />
            <NavItem to="/equipamento" text="Equipamento" />
            <NavItem to="/manutencao" text="Manutenção" />
            <NavItem to="/ordem-servico" text="Ordem de Serviço" />
            <NavItem to="/operacao" text="Operação" />
            <NavItem to="/boletim" text="Boletim" />
            <NavItem to="/operador" text="Operador" />
            <NavItem to="/usuario" text="Usuário" />
          </div>
        </div>
        <div className="border-grey-light border-t pt-2">
          <NavItem to="/logout" text="Sair" />
        </div>
      </div>
      <div className="w-full">
        <div className="border-t-blue border-t-8 w-full h-screen p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

const NavItem = ({ to, text }: { to: string; text: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${isActive && 'text-blue font-semibold'} text-sm hover:text-blue/80`
      }
    >
      {text}
    </NavLink>
  );
};
