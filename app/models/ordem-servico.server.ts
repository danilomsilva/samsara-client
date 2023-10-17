import type { User } from '~/session.server';
import { formatDateTime } from '~/utils/utils';

export type OS = {
  id?: string;
  created?: string;
  codigo?: string;
  descricao?: string;
};

export async function getOSs(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/ordem_servico/records?perPage=100`;

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
    const transformedData = data.items.map((item: OS) => ({
      id: item.id,
      created: item?.created && formatDateTime(item.created),
      codigo: item.codigo,
      descricao: item.descricao,
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting OSs');
  }
}

export async function getOS(userToken: User['token'], osId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/ordem_servico/records/${osId}`,
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
    throw new Error('An error occured while getting OS');
  }
}

export async function createOS(userToken: User['token'], body: OS) {
  const OSs = await getOSs(userToken, 'created');
  const existingCodigo = OSs.some((os: OS) => os.codigo === body.codigo);
  if (existingCodigo) {
    return { data: 'Codigo existente' };
  } else {
    try {
      const response = await fetch(
        `${process.env.BASE_API_URL}/collections/ordem_servico/records`,
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
      throw new Error('An error occured while creating OS');
    }
  }
}

export async function updateOS(
  userToken: User['token'],
  osId: string,
  body: OS
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/ordem_servico/records/${osId}`,
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
    throw new Error('An error occured while updating OS');
  }
}

export async function deleteOS(userToken: User['token'], osId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/ordem_servico/records/${osId}`,
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
    throw new Error('An error occured when deleting the OS');
  }
}
