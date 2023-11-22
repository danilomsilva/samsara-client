import type { User } from '~/session.server';
import { formatDateTime } from '~/utils/utils';
import { _updateEquipamento, getEquipamento } from './equipamento.server';
import { getOperador } from './operador.server';
import {
  type Boletim,
  getBoletins,
  updateBoletim,
  _updateBoletim,
} from './boletim.server';

export type Manutencao = {
  id?: string;
  created?: string;
  data_manutencao?: string;
  boletim?: string;
  equipamento?: string;
  IM_atual?: string;
  tipo_manutencao?: string;
  feito_por?: string;
  feito_porX?: string;
  encarregado?: string;
  expand?: {
    equipamento: {
      codigo: string;
    };
    encarregado?: {
      nome_completo: string;
    };
  };
  equipamentoX?: string;
  encarregadoX?: string;
  descricao?: string;
  inativo?: boolean;
};

export async function getManutencoes(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/manutencao/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);
  //Auto expand record relations. Ex.: ?expand=relField1,relField2.subRelField - From Pocketbase Docs
  queryParams.set('expand', 'encarregado,equipamento');

  if (queryParams.toString()) {
    url += `?${queryParams.toString()}&perPage=100`;
  } else {
    url += `?perPage=100`;
  }
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    const transformedData = data.items.map((item: Manutencao) => ({
      id: item.id,
      created: item?.created && formatDateTime(item.created),
      boletim: item.boletim,
      IM_atual: item.IM_atual,
      tipo_manutencao: item.tipo_manutencao,
      feito_porX: item?.feito_porX,
      equipamento: item?.equipamento,
      equipamentoX: item.equipamentoX,
      encarregadoX: item.encarregadoX,
      inativo: item?.inativo,
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting manutencoes');
  }
}

export async function getManutencao(
  userToken: User['token'],
  manutencaoId: string
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/manutencao/records/${manutencaoId}?expand=equipamento,encarregado`, //expand on usuario tipo encarregado
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
    throw new Error('An error occured while getting manutencao');
  }
}

export async function _createManutencao(
  userToken: User['token'],
  body: Manutencao
) {
  const manutencao = await createManutencao(userToken, body);
  const equipamento = await getEquipamento(
    userToken,
    body.equipamento as string
  );
  const operador = await getOperador(userToken, body.feito_por as string);
  const editBody = {
    equipamentoX: equipamento.codigo,
    feito_porX: operador.nome_completo,
    encarregadoX: operador.encarregadoX,
  };
  await updateManutencao(userToken, manutencao.id, editBody);
  //will update equipamento to reset IM and revisao calcs
  if (body?.tipo_manutencao === 'Revisão') {
    const equipBody = {
      ...equipamento,
      proxima_revisao:
        equipamento.instrumento_medicao_atual + equipamento.frequencia_revisao,
      revisao_status:
        Number(equipamento?.proxima_revisao) -
        (Number(equipamento?.instrumento_medicao_atual) * 100) /
          Number(equipamento?.frequencia_revisao),
    };
    await _updateEquipamento(userToken, equipamento.id, equipBody);
  }
  return manutencao;
}

export async function createManutencao(
  userToken: User['token'],
  body: Manutencao
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/manutencao/records`,
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
    throw new Error('An error occured while creating manutencao');
  }
}

export async function _updateManutencao(
  userToken: User['token'],
  manutencaoId: string,
  body: Manutencao
) {
  const manutencao = await updateManutencao(userToken, manutencaoId, body);
  const equipamento = await getEquipamento(
    userToken,
    body.equipamento as string
  );
  const operador = await getOperador(userToken, body.feito_por as string);
  const editBody = {
    equipamentoX: equipamento.codigo,
    feito_porX: operador.nome_completo,
    encarregadoX: operador.encarregadoX,
  };
  await updateManutencao(userToken, manutencao.id, editBody);
  if (body.boletim) {
    const boletins = await getBoletins(userToken, 'created');
    const findBoletim = boletins?.find(
      (item: Boletim) => item.codigo === body.boletim
    )?.id;
    await updateBoletim(userToken, findBoletim, {
      descricao_manutencao: body?.descricao,
    });
  }
  return manutencao;
}

export async function updateManutencao(
  userToken: User['token'],
  manutencaoId: string,
  body: Manutencao
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/manutencao/records/${manutencaoId}`,
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
    throw new Error('An error occured while updating manutencao');
  }
}

export async function deleteManutencao(
  userToken: User['token'],
  manutencaoId: string
) {
  try {
    const manutencao = await getManutencao(userToken, manutencaoId);
    const boletins = await getBoletins(userToken, 'created');
    const findBoletim = await boletins.find(
      (item: Boletim) => item.codigo === manutencao.boletim
    )?.id;

    await _updateBoletim(userToken, findBoletim, {
      manutencao: false,
      descricao_manutencao: '',
    });

    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/manutencao/records/${manutencaoId}`,
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
    throw new Error('An error occured while deleting manutencao');
  }
}
