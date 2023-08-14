import { json, type V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export async function loader() {
  try {
    const response = await fetch(
      'https://samsara-api-m38hl.ondigitalocean.app/api/operadores'
    );
    const data = await response.json();
    return json({ data: data.data });
  } catch (error) {}
}

export default function Index() {
  const { data } = useLoaderData();

  return (
    <div>
      {data.map((operador: any) => {
        return (
          <div key={operador.id}>
            <div>{operador.attributes.nome_completo}</div>
          </div>
        );
      })}
    </div>
  );
}
