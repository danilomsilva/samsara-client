import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserSession } from '~/session.server';

export const action: ActionFunction = async ({ request }) => {
  const { userToken } = await getUserSession(request);
  const formData = Object.fromEntries(await request.formData());
  console.log('>>>>>>>', formData);

  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/files/${formData.collectionId}/${formData.id}/${formData.fileName}?download=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    console.log('>>>>>>>>------', data);
    return data;
  } catch (err) {
    console.log(err);
    return json({ err });
  }
};
