import type { User } from '~/session.server';
import { formatDate, formatDateTime } from '~/utils/utils';

export type Obra = {
  created?: string;
  cidade?: string;
  data_final_previsto?: string;
  data_inicio?: string;
  id?: string;
  nome?: string;
  inativo?: boolean;
  motivo?: string;
};

export async function getObras(
  userToken: User['token'],
  sortingBy: string | null,
  filter?: string
) {
  let url = `${process.env.BASE_API_URL}/collections/obra/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);

  queryParams.set('perPage', '200'); //TODO: set max items per page when querying db
  queryParams.set('filter', filter ?? '');
  // (data_inicio>='1999-01-02' && data_inicio<='2005-01-02')

  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
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
    const transformedData = data.items.map((item: Obra) => ({
      id: item?.id,
      created: item?.created && formatDateTime(item.created),
      nome: item?.nome,
      cidade: item?.cidade,
      data_inicio: item?.data_inicio && formatDate(item.data_inicio),
      data_final_previsto:
        item?.data_final_previsto && formatDate(item.data_final_previsto),
      inativo: item?.inativo,
      motivo: item?.motivo,
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

export async function createObra(userToken: User['token'], body: Obra) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/obra/records`,
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
    throw new Error('An error occured while creating obra');
  }
}

export async function updateObra(
  userToken: User['token'],
  obraId: string,
  body: Obra
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/obra/records/${obraId}`,
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
    throw new Error('An error occured while updating obra');
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
