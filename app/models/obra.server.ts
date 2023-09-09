import type { User } from '~/session.server';

export type Obra = {
  cidade?: string;
  data_final_previsto?: string;
  data_inicio?: string;
  id?: string;
  nome?: string;
};

export async function getObras(userToken: User['token']): Promise<Obra[]> {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/obra/records`,
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
