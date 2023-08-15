import type { V2_MetaFunction } from '@remix-run/node';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Samsara' },
    { name: 'Samsara Construtora', content: 'Samsara Construtora' },
  ];
};

export default function Index() {
  return <div className="text-3xl text-blue-500">Hello World!!</div>;
}
