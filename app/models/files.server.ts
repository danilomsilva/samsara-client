import { type User } from '~/session.server';
import { type Manutencao } from './manutencao.server';
import { type Boletim } from './boletim.server';

export type FileTypes = {
  collectionId: string;
  collectionName: string;
  created: string;
  file: string[];
  id: string;
  manutencao?: Manutencao['id'];
  boletim?: Boletim['id'];
  name: string;
  updated: string;
};

export async function getFiles(userToken: User['token'], path: string) {
  let url = `${process.env.BASE_API_URL}/collections/${path}_files/records`;

  const queryParams = new URLSearchParams();

  if (queryParams.toString()) url += `?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    return await response.json();
  } catch (error) {
    throw new Error('An error occured while getting manutencao files');
  }
}
