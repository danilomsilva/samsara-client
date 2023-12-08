import { type User } from '~/session.server';

export async function uploadFile(userToken: User['token'], body: File) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/manutencao/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body,
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while uploading file!');
  }
}
