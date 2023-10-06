import { type V2_MetaFunction } from '@remix-run/node';

// page title
export const meta: V2_MetaFunction = () => {
  return [{ title: 'Boletim | Samsara' }];
};

export default function Boletim() {
  return 'Boletim';
}
