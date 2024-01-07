import type { User } from '~/session.server';
import { formatDateTime } from '~/utils/utils';

export type EquipamentoTipo = {
  id?: string;
  created?: string;
  tipo_nome?: string;
  expand?: {
    grupo_nome?: {
      grupo_nome?: string;
    };
  };
  grupo_nome?: string;
  grupo_nomeX?: string;
  inativo?: boolean;
  motivo?: string;
  operacoes?: string[];
  array_operacoes?: string;
};

export async function getEquipamentoTipos(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/equipamento_tipo/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);
  queryParams.set('perPage', '200'); //set max items per page when querying db

  queryParams.set('expand', 'grupo_nome');
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    const transformedData = data.items.map((item: EquipamentoTipo) => ({
      id: item?.id,
      created: item?.created && formatDateTime(item.created),
      tipo_nome: item?.tipo_nome,
      grupo_nome: item?.grupo_nome,
      grupo_nomeX: item?.grupo_nomeX,
      inativo: item?.inativo,
      motivo: item?.motivo,
      operacoes: item?.operacoes,
      array_operacoes: item?.array_operacoes,
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting tipos de equipamento');
  }
}

export async function getEquipamentoTipo(
  userToken: User['token'],
  equipTipoId: string
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento_tipo/records/${equipTipoId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while getting  tipo de equipamento');
  }
}

export async function getEquipamentoGrupo(
  userToken: User['token'],
  equipGrupoId: string
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento_grupo/records/${equipGrupoId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while getting  tipo de equipamento');
  }
}

export async function _createEquipamentoTipo(
  userToken: User['token'],
  body: EquipamentoTipo
) {
  const parsedArrayOperacoes = JSON.parse(body.array_operacoes as string);
  const sortedArrayOperacoes = parsedArrayOperacoes.sort((a: any, b: any) =>
    a.codigo.localeCompare(b.codigo)
  );

  const newEquipamentoTipo = await createEquipamentoTipo(userToken, {
    ...body,
    array_operacoes: sortedArrayOperacoes,
  });
  const { grupo_nome } = await getEquipamentoGrupo(
    userToken,
    newEquipamentoTipo.grupo_nome
  );

  const onlyOperacoesIds = sortedArrayOperacoes?.map((item) => item.id);

  const editBody = {
    grupo_nomeX: grupo_nome,
    operacoes: onlyOperacoesIds,
  };
  await updateEquipamentoTipo(userToken, newEquipamentoTipo.id, editBody);
  return newEquipamentoTipo;
}

export async function _updateEquipamentoTipo(
  userToken: User['token'],
  equipTipoId: string,
  body: EquipamentoTipo
) {
  const parsedArrayOperacoes = JSON.parse(body.array_operacoes as string);
  const sortedArrayOperacoes = parsedArrayOperacoes.sort((a: any, b: any) =>
    a.codigo.localeCompare(b.codigo)
  );

  const newEquipamentoTipo = await updateEquipamentoTipo(
    userToken,
    equipTipoId,
    {
      ...body,
      array_operacoes: sortedArrayOperacoes,
    }
  );
  const { grupo_nome } = await getEquipamentoGrupo(
    userToken,
    newEquipamentoTipo.grupo_nome
  );

  const onlyOperacoesIds = sortedArrayOperacoes?.map((item) => item.id);

  const editBody = {
    grupo_nomeX: grupo_nome,
    operacoes: onlyOperacoesIds,
  };
  await updateEquipamentoTipo(userToken, newEquipamentoTipo.id, editBody);
  return newEquipamentoTipo;
}

export async function createEquipamentoTipo(
  userToken: User['token'],
  body: EquipamentoTipo
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento_tipo/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while creating tipo de equipamento');
  }
}

export async function updateEquipamentoTipo(
  userToken: User['token'],
  equipTipoId: string,
  body: EquipamentoTipo
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento_tipo/records/${equipTipoId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while updating tipo de equipamento');
  }
}

export async function deleteEquipamentoTipo(
  userToken: User['token'],
  equipTipoId: string
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento_tipo/records/${equipTipoId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while deleting tipo de equipamento');
  }
}
