import { Form, NavLink } from '@remix-run/react';
import { useState, type ReactNode } from 'react';
import DoubleLeftArrowIcon from './icons/DoubleLeftArrowIcon';
import DoubleRightArrowIcon from './icons/DoubleRightArrowIcon';
import clsx from 'clsx';
import { type TipoAcesso, type Usuario } from '~/models/usuario.server';

type PropTypes = {
  tipoAcesso: TipoAcesso;
  children: ReactNode;
  user: Usuario['nome_completo'];
};

export default function SideMenu({ tipoAcesso, children, user }: PropTypes) {
  const [isOpen, setIsOpen] = useState(true);
  const userFirstName = user?.split(' ')[0];
  const fullAccess = tipoAcesso !== 'Encarregado';

  return (
    <div className="bg-grey-light h-screen flex">
      <div
        className={clsx(
          ` ${
            isOpen ? 'min-w-[180px] max-w-[180px]' : 'w-[50px]'
          } bg-white h-screen px-6 py-8 gap-8 flex flex-col relative`
        )}
      >
        {isOpen && (
          <>
            <div className="flex flex-col items-center gap-2">
              <img src="/assets/logo.png" alt="logo" width={60} height={60} />
              <h1 className="font-semibold">Olá, {userFirstName}!</h1>
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
                {fullAccess ? (
                  <>
                    <NavItem to="/obra" text="Obra" />
                    <NavItem to="/equipamento" text="Equipamento" />
                    <NavItem to="/equipamento_tipo" text="Tipos Equipamento" />
                    <NavItem to="/manutencao" text="Manutenção" />
                    <NavItem to="/ordem-servico" text="Ordem de Serviço" />
                    <NavItem to="/operacao" text="Operação" />
                    <NavItem to="/boletim" text="Boletim" />
                    <NavItem to="/operador" text="Operador" />
                    <NavItem to="/usuario" text="Usuário" />
                  </>
                ) : (
                  <NavItem to="/boletim" text="Boletim" />
                )}
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
          {isOpen ? <DoubleLeftArrowIcon /> : <DoubleRightArrowIcon />}
        </div>
      </div>
      <div className="w-full">
        <div className="border-t-blue border-t-8 w-full h-screen p-4 pl-6">
          <div className="h-full overflow-hidden">{children}</div>
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
        `${
          isActive && 'text-blue font-semibold'
        } text-sm hover:text-blue/80 whitespace-nowrap`
      }
    >
      {text}
    </NavLink>
  );
};
