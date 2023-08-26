import { Form, NavLink } from '@remix-run/react';
import { useState, type ReactNode } from 'react';
import DoubleLeftArrow from './icons/DoubleLeftArrow';
import DoubleRightArrow from './icons/DoubleRightArrow';
import clsx from 'clsx';

export default function SideMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-grey-light h-screen flex">
      <div
        className={clsx(
          ` ${
            isOpen ? 'w-[250px]' : 'w-[50px]'
          } bg-white h-screen px-6 py-8 gap-8 flex flex-col relative`
        )}
      >
        {isOpen && (
          <>
            <div className="flex flex-col items-center gap-2">
              <img src="/assets/logo.png" alt="logo" width={60} height={60} />
              <h1 className="font-semibold">Olá, usuário!</h1>
            </div>
            <div className="border-grey-light border-t flex flex-col gap-2">
              <h2 className="uppercase text-xs font-semibold mt-2">
                Dashboard
              </h2>
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
            <div className="flex justify-between items-center border-grey-light border-t w-full ">
              <Form action="/logout" method="post">
                <button type="submit" className="pt-1 text-sm text-left">
                  Sair
                </button>
              </Form>
            </div>
          </>
        )}
        <div
          className="p-1 rounded-full bg-white hover:bg-grey-light cursor-pointer absolute bottom-11 -right-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <DoubleLeftArrow /> : <DoubleRightArrow />}
        </div>
      </div>
      <div className="w-full">
        <div className="border-t-blue border-t-8 w-full h-screen p-4 pl-6">
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
