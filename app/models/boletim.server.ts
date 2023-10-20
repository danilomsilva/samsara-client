import type { User } from '~/session.server';
import { formatDateTime } from '~/utils/utils';

export type Boletim = {
  created?: string;
  id?: string;
  codigo?: string; // TODO: make sure it appears on boletim form
  abastecimento_1?: number;
  abastecimento_2?: number;
  abastecimento_3?: number;
  data_boletim?: string;
  descricao_equipamento?: string;
  encarregado?: string;
  encarregadoX?: string;
  equipamento?: string;
  equipamentoX?: string;
  equipamento_logs?: {
    index: string;
    OS: string;
    OP: string;
    hora_inicio: string;
    hora_final: string;
    IM_inicio: string;
    IM_final: string;
  }[];
  limpeza?: boolean;
  lubrificacao?: boolean;
  manutencao?: boolean;
  operador?: string;
  operadorX?: string;
  obra?: string;
  obraX?: string;
};

export async function getBoletins(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/boletim/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);
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

    const transformedData = data.items.map((item: Boletim) => {
      return {
        id: item?.id,
        created: item?.created && formatDateTime(item.created),
        data_boletim: item?.data_boletim && formatDateTime(item.data_boletim),
        codigo: item?.codigo,
        equipamentoX: item?.equipamentoX,
        descricao_equipamento: item?.descricao_equipamento,
        operadorX: item?.operadorX,
        equipamento_logs: item?.equipamento_logs,
        IM_inicio: item?.equipamento_logs?.find(
          (log) => log.index === String(0)
        )?.IM_inicio,
        IM_final:
          item?.equipamento_logs?.[item.equipamento_logs.length - 1]?.IM_final,
        obraX: item?.obraX,
        encarregadoX: item?.encarregadoX,
        total_abastecimento:
          Number(item?.abastecimento_1) +
          Number(item?.abastecimento_2) +
          Number(item?.abastecimento_3),
        manutencao: item?.manutencao,
        lubrificacao: item?.lubrificacao,
        limpeza: item?.limpeza,
      };
    });

    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting boletins');
  }
}

export async function getBoletim(userToken: User['token'], boletimId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/boletim/records/${boletimId}`,
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
    throw new Error('An error occured while getting boletim');
  }
}

export async function createBoletim(userToken: User['token'], body: Boletim) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/boletim/records`,
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
    throw new Error('An error occured while creating boletim');
  }
}

export async function updateBoletim(
  userToken: User['token'],
  boletimId: string,
  body: Boletim
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/boletim/records/${boletimId}`,
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
    throw new Error('An error occured while updating boletim');
  }
}

export async function deleteBoletim(
  userToken: User['token'],
  boletimId: string
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/boletim/records/${boletimId}`,
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
    throw new Error('An error occured while deleting boletim');
  }
}
