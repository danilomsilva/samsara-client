import { type User } from '~/session.server';

export async function getFiles(userToken: User['token']) {
  let url = `${process.env.BASE_API_URL}/collections/files/records`;

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
    throw new Error('An error occured while getting obras');
  }
}
