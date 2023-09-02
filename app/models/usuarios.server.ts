import type { User } from '~/session.server';
import { formatDate } from '~/utils/utils';

export type Usuario = {
  id?: string;
  created?: string;
  codigo?: string;
  nome_completo?: string;
  email?: string;
  password?: FormDataEntryValue;
  passwordConfirm?: FormDataEntryValue;
  emailVisibility?: boolean;
  tipo_acesso?: string;
  expand?: {
    obra: {
      nome: string;
    };
  };
};

// if valid will retrieve jwt token and user data
export async function getUsuarios(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/usuario/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);
  //Auto expand record relations. Ex.: ?expand=relField1,relField2.subRelField - From Pocketbase Docs
  queryParams.set('expand', 'obra');
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
    const transformedData = data.items.map((item: Usuario) => ({
      id: item.id,
      created: item?.created && formatDate(item.created),
      codigo: item.codigo,
      nome_completo: item.nome_completo,
      email: item.email,
      tipo_acesso: item.tipo_acesso,
      obra: item?.expand?.obra.nome,
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured when verifying credentials!');
  }
}

export async function getUsuario(userToken: User['token'], userId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/usuario/records/${userId}?expand=obra`,
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
    throw new Error('An error occured when verifying credentials!');
  }
}

export async function createUsuario(userToken: User['token'], body: Usuario) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/usuario/records`,
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
    throw new Error('An error occured when verifying credentials!');
  }
}

export async function updateUsuario(
  userToken: User['token'],
  userId: string,
  body: Usuario
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/usuario/records/${userId}`,
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
    throw new Error('An error occured when verifying credentials!');
  }
}
