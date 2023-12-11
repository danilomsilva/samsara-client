import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserSession } from '~/session.server';

export const action: ActionFunction = async ({ request }) => {
  const { userToken } = await getUserSession(request);
  const formData = await request.formData();

  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/manutencao/records`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      }
    );
    console.log('>>>>>>>>>>>', response);
    return response;
  } catch (err) {
    console.log(err);
    return json({ err });
  }
};
