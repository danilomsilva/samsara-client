import type { User } from '~/session.server';
import {
  formatDate,
  formatDateTime,
  formatNumberWithDotDelimiter,
} from '~/utils/utils';
import { _updateEquipamento, getEquipamento } from './equipamento.server';
import { getOperador } from './operador.server';
import {
  type Boletim,
  getBoletins,
  updateBoletim,
  _updateBoletim,
} from './boletim.server';

export type ManutencaoResponse = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: Manutencao[];
};

export type Manutencao = {
  id?: string;
  created?: string;
  data_manutencao?: string;
  boletim?: string;
  equipamento?: string;
  IM_atual?: string;
  IM_revisao?: string;
  tipo_manutencao?: string;
  feito_por?: string;
  feito_porX?: string;
  encarregado?: string;
  expand?: {
    equipamento: {
      codigo: string;
      modelo: string;
      instrumento_medicao: string;
    };
    encarregado?: {
      nome_completo: string;
    };
  };
  equipamentoX?: string;
  encarregadoX?: string;
  descricao?: string;
  inativo?: boolean;
  motivo?: string;
  modelo_equipamento?: string;
};

export async function getManutencoes(
  userToken: User['token'],
  sortingBy: string | null,
  filter?: string,
  page?: string,
  perPage?: string
): Promise<ManutencaoResponse> {
  let url = `${process.env.BASE_API_URL}/collections/manutencao/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy === '+boletim') {
    queryParams.set('sort', '+created');
  } else if (sortingBy === '-boletim') {
    queryParams.set('sort', '-created');
  } else {
    queryParams.set('sort', sortingBy ?? '');
  }
  //Auto expand record relations. Ex.: ?expand=relField1,relField2.subRelField - From Pocketbase Docs
  queryParams.set('expand', 'encarregado,equipamento');
  queryParams.set('page', page ?? '1');
  queryParams.set('perPage', perPage ?? '30');
  queryParams.set('filter', filter ?? '');

  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
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
    const transformedData = data?.items?.map((item: Manutencao) => {
      return {
        id: item.id,
        data_manutencao:
          item?.data_manutencao && formatDate(item?.data_manutencao),
        created: item?.created && formatDateTime(item.created),
        boletim: item.boletim,
        IM_atual: item.IM_atual,
        IM_revisao: item.IM_revisao,
        tipo_manutencao: item.tipo_manutencao,
        feito_porX: item?.feito_porX,
        equipamento: item?.equipamento,
        equipamentoX: item.equipamentoX,
        encarregadoX: item.encarregadoX,
        modelo_equipamento: item.expand?.equipamento.modelo,
        inativo: item?.inativo,
        motivo: item?.motivo,
      };
    });
    return { ...data, items: transformedData };
  } catch (error) {
    throw new Error('An error occured while getting manutencoes');
  }
}

export async function getManutencao(
  userToken: User['token'],
  manutencaoId: string
): Promise<Manutencao> {
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
      proxima_revisao: Number(
        Number(body?.IM_revisao) + Number(equipamento.frequencia_revisao)
      ).toFixed(2),
      revisao_status:
        Number(equipamento?.proxima_revisao) - Number(body?.IM_revisao),
    };
    await _updateEquipamento(userToken, equipamento.id, equipBody, {
      skipProxRevisaoCalc: true,
    });
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

  if (body?.tipo_manutencao === 'Revisão') {
    const equipBody = {
      ...equipamento,
      proxima_revisao: Number(
        Number(body?.IM_revisao) + Number(equipamento.frequencia_revisao)
      ).toFixed(2),
    };
    await _updateEquipamento(userToken, equipamento.id as string, equipBody, {
      skipProxRevisaoCalc: true,
    });
  }

  await updateManutencao(userToken, manutencao.id, editBody);
  if (body.boletim) {
    const boletins = await getBoletins(userToken, 'created', '');
    const findBoletim = boletins?.items?.find(
      (item) => item.codigo === body.boletim
    )?.id;
    if (findBoletim) {
      await updateBoletim(userToken, findBoletim, {
        descricao_manutencao: body?.descricao,
      });
    }
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
    const boletins = await getBoletins(userToken, 'created', '');
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
