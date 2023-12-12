import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserSession } from '~/session.server';

export const action: ActionFunction = async ({ request }) => {
  const { userToken } = await getUserSession(request);
  const formData = Object.fromEntries(await request.formData());

  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/manutencao_files/records/${formData.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    return json({ err });
  }
  return json({});
};
