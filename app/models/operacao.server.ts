import type { User } from '~/session.server';
import { formatDateTime } from '~/utils/utils';

export type Operacao = {
  id?: string;
  created?: string;
  codigo?: string;
  descricao?: string;
};

export async function getOperacoes(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/operacao/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}&perPage=100`;
  } else {
    url += `?perPage=100`;
  }
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    const transformedData = data.items.map((item: Operacao) => ({
      id: item.id,
      created: item?.created && formatDateTime(item.created),
      codigo: item.codigo,
      descricao: item.descricao,
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting Operacoes');
  }
}

export async function getOperacao(userToken: User['token'], opId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/operacao/records/${opId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while getting Operacao');
  }
}

export async function createOperacao(userToken: User['token'], body: Operacao) {
  const operacoes = await getOperacoes(userToken, 'created');
  const existingCodigo = operacoes.some(
    (op: Operacao) => op.codigo === body.codigo
  );
  if (existingCodigo) {
    return { data: 'Codigo existente' };
  } else {
    try {
      const response = await fetch(
        `${process.env.BASE_API_URL}/collections/operacao/records`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('An error occured while creating Operacao');
    }
  }
}

export async function updateOperacao(
  userToken: User['token'],
  opId: string,
  body: Operacao
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/operacao/records/${opId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while updating Operacao');
  }
}

export async function deleteOperacao(userToken: User['token'], opId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/operacao/records/${opId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured when deleting the Operacao');
  }
}
