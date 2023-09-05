import type { User } from '~/session.server';
import { formatDate } from '~/utils/utils';

export type Operador = {
  id?: string;
  created?: string;
  codigo?: string;
  nome_completo?: string;
  atividade?: string;
  expand?: {
    obra: {
      nome: string;
    };
    encarregado?: {
      nome_completo: string;
    };
  };
};

export async function getOperadores(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/operador/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);
  //Auto expand record relations. Ex.: ?expand=relField1,relField2.subRelField - From Pocketbase Docs
  queryParams.set('expand', 'obra,encarregado');
  if (queryParams.toString()) url += `?${queryParams.toString()}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    const transformedData = data.items.map((item: Operador) => ({
      id: item.id,
      created: item?.created && formatDate(item.created),
      codigo: item.codigo,
      nome_completo: item.nome_completo,
      atividade: item.atividade,
      obra: item?.expand?.obra.nome,
      encarregado: item?.expand?.encarregado?.nome_completo,
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting operadores');
  }
}

export async function getOperador(userToken: User['token'], userId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/operador/records/${userId}?expand=obra`, //expand on usuario tipo encarregado
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while getting operador');
  }
}

export async function createOperador(userToken: User['token'], body: Operador) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/operador/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    console.log('>>>>>>>>>>>>>', data);
    return data;
  } catch (error) {
    throw new Error('An error occured while creating operador');
  }
}

export async function updateOperador(
  userToken: User['token'],
  userId: string,
  body: Operador
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/operador/records/${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while updating operador');
  }
}

export async function deleteOperador(userToken: User['token'], userId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/operador/records/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while deleting operador');
  }
}
