import type { User } from '~/session.server';
import { formatDate, formatDateTime } from '~/utils/utils';

export type Obra = {
  created?: string;
  cidade?: string;
  data_final_previsto?: string;
  data_inicio?: string;
  id?: string;
  nome?: string;
};

export async function getObras(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/obra/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);
  if (queryParams.toString()) url += `?${queryParams.toString()}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    const transformedData = data.items.map((item: Obra) => ({
      created: item?.created && formatDateTime(item.created),
      nome: item?.nome,
      cidade: item?.cidade,
      data_inicio: item?.data_inicio && formatDate(item.data_inicio),
      data_final_previsto:
        item?.data_final_previsto && formatDate(item.data_final_previsto),
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting obras');
  }
}

export async function getObra(userToken: User['token'], obraId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/obra/records/${obraId}`,
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
    throw new Error('An error occured while getting obra');
  }
}

export async function deleteObra(userToken: User['token'], obraId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/obra/records/${obraId}`,
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
    throw new Error('An error occured while deleting obra');
  }
}
