import { type V2_MetaFunction } from '@remix-run/node';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Manutenção | Samsara' }];
};

export default function Manutencao() {
  return 'Manutencao';
}
