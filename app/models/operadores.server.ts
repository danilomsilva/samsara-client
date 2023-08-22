import type { User } from '~/session.server';

// if valid will retrieve jwt token from strapi and user data
export async function getOperadores(userToken: User['token']) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/operador/records`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    return await response.json();
  } catch (error) {
    throw new Error('An error occured when verifying credentials!');
  }
}
