import type { User } from '~/session.server';
import { formatDateTime } from '~/utils/utils';
import { getObra } from './obra.server';
import { getUsuario } from './usuario.server';

export type Equipamento = {
  id?: string;
  created?: string;
  codigo?: string;
  obraX?: string;
  valor_locacao?: string;
  tipo_locacao?: string;
  ano?: string;
  combustivel?: string;
  encarregadoX?: string;
  instrumento_medicao?: 'Km' | 'Hr';
  instrumento_medicao_inicio?: number;
  instrumento_medicao_atual?: number;
  frequencia_revisao?: string;
  notificar_revisao_faltando?: string;
  expand?: {
    obra: {
      nome: string;
    };
    encarregado?: {
      nome_completo: string;
    };
  };
};

export async function getEquipamentos(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/equipamento/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);
  queryParams.set('expand', 'obra,encarregado');
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
    console.log('data >>>>>>>>>>>>>>', data);
    const transformedData = data.items.map((item: Equipamento) => ({
      id: item.id,
      created: item?.created && formatDateTime(item.created),
      codigo: item.codigo,
      obra: item.obraX,
      valor_locacao: item.valor_locacao,
      tipo_locacao: item.tipo_locacao,
      ano: item.ano,
      combustivel: item.combustivel,
      encarregado: item.encarregadoX,
      instrumento_medicao: item.instrumento_medicao,
      instrumento_medicao_inicio: item.instrumento_medicao_inicio,
      instrumento_medicao_atual: item.instrumento_medicao_atual,
      frequencia_revisao: item.frequencia_revisao,
      notificar_revisao_faltando: item.notificar_revisao_faltando,
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting equipamentos');
  }
}

export async function getEquipamento(
  userToken: User['token'],
  equipamentoId: string
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento/records/${equipamentoId}?expand=obra`,
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
    throw new Error('An error occured while getting equipamento ');
  }
}

export async function _createEquipamento(
  userToken: User['token'],
  body: Equipamento
) {
  const equipamento = await createEquipamento(userToken, body);
  console.log('----------------===========', equipamento);
  const { nome } = await getObra(userToken, equipamento.obra);
  const { nome_completo } = await getUsuario(
    userToken,
    equipamento.encarregado
  );
  console.log(nome_completo);
  const editBody = {
    obraX: nome,
    encarregadoX: nome_completo,
  };
  console.log('------------', editBody);
  await updateEquipamento(userToken, equipamento.id, editBody);
  return equipamento;
}

export async function createEquipamento(
  userToken: User['token'],
  body: Equipamento
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento/records`,
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
    throw new Error('An error occured while creating equipamento ');
  }
}

export async function _updateEquipamento(
  userToken: User['token'],
  equipamentoId: string,
  body: Equipamento
) {
  const usuario = await updateEquipamento(userToken, equipamentoId, body);
  const { nome } = await getObra(userToken, usuario.obra);
  const editBody = {
    obraX: nome,
  };
  await updateEquipamento(userToken, usuario.id, editBody);
  return usuario;
}

export async function updateEquipamento(
  userToken: User['token'],
  userId: string,
  body: Equipamento
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento/records/${userId}`,
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
    throw new Error('An error occured while updating equipamento ');
  }
}

export async function deleteEquipamento(
  userToken: User['token'],
  equipamentoId: string
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento/records/${equipamentoId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured when deleting equipamento');
  }
}
