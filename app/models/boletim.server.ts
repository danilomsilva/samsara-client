import type { User } from '~/session.server';
import { formatDate, formatDateTime } from '~/utils/utils';
import { getEquipamento } from './equipamento.server';
import { getUsuario } from './usuario.server';
import { getOperador } from './operador.server';
import { getObra } from './obra.server';

export type EquipamentoLog = {
  index: string | number;
  OS: string;
  OP: string;
  hora_inicio: string;
  hora_final: string;
  IM_inicio: string;
  IM_final: string;
};

export type Boletim = {
  created?: string;
  id?: string;
  codigo?: string;
  abastecimento_1?: number;
  abastecimento_2?: number;
  abastecimento_3?: number;
  data_boletim?: string;
  tipo_equipamento?: string;
  encarregado?: string;
  encarregadoX?: string;
  equipamento?: string;
  equipamentoX?: string;
  equipamento_logs?: EquipamentoLog[];
  limpeza?: boolean;
  lubrificacao?: boolean;
  manutencao?: boolean;
  operador?: string;
  operadorX?: string;
  obra?: string;
  obraX?: string;
  IM_inicioX?: string;
  IM_finalX?: string;
  total_abastecimento?: string;
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
        data_boletim: item?.data_boletim && formatDate(item.data_boletim),
        codigo: item?.codigo,
        equipamentoX: item?.equipamentoX,
        tipo_equipamento: item?.tipo_equipamento,
        operadorX: item?.operadorX,
        equipamento_logs: item?.equipamento_logs,
        IM_inicio: item?.equipamento_logs?.find(
          (log) => Number(log?.index) === 0
        )?.IM_inicio,
        IM_inicioX: item?.IM_inicioX,
        IM_final:
          item?.equipamento_logs?.[item.equipamento_logs.length - 1]?.IM_final,
        IM_finalX: item?.IM_finalX,
        obraX: item?.obraX,
        encarregadoX: item?.encarregadoX,
        total_abastecimento: item?.total_abastecimento,
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

export async function _createBoletim(userToken: User['token'], body: Boletim) {
  const boletim = await createBoletim(userToken, body);
  if (boletim.data) {
    return boletim;
  } else {
    const equipamento = await getEquipamento(userToken, boletim.equipamento);
    const { nome_completo: encarregado } = await getUsuario(
      userToken,
      boletim.encarregado
    );
    const { nome_completo: operador } = await getOperador(
      userToken,
      boletim.operador
    );
    const { nome } = await getObra(userToken, boletim.obra);

    const editBody = {
      obraX: nome,
      encarregadoX: encarregado,
      operadorX: operador,
      equipamentoX: equipamento.codigo,
      // IM_inicioX: body.IM_inicio_0,
      IM_finalX:
        body?.equipamento_logs?.[body.equipamento_logs.length - 1]?.IM_final,
      total_abastecimento:
        Number(body?.abastecimento_1) +
          Number(body?.abastecimento_2) +
          Number(body?.abastecimento_3) || '0',
    };

    await updateBoletim(userToken, boletim.id, editBody);
    return boletim;
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

    return await response.json();
  } catch (error) {
    throw new Error('An error occured while creating boletim');
  }
}

export async function _updateBoletim(
  userToken: User['token'],
  boletimId: string,
  body: Boletim
) {
  const boletim = await updateBoletim(userToken, boletimId, body);
  if (boletim.data) {
    return boletim;
  } else {
    const equipamento = await getEquipamento(userToken, boletim.equipamento);
    const { nome_completo: encarregado } = await getUsuario(
      userToken,
      boletim.encarregado
    );
    const { nome_completo: operador } = await getOperador(
      userToken,
      boletim.operador
    );
    const { nome } = await getObra(userToken, boletim.obra);

    const editBody = {
      obraX: nome,
      encarregadoX: encarregado,
      operadorX: operador,
      equipamentoX: equipamento.codigo,
      IM_inicioX: body.IM_inicio_0, // TODO: fix this error
      IM_finalX:
        body?.equipamento_logs?.[body.equipamento_logs.length - 1]?.IM_final,
      total_abastecimento:
        Number(body?.abastecimento_1) +
          Number(body?.abastecimento_2) +
          Number(body?.abastecimento_3) || '0',
    };

    await updateBoletim(userToken, boletim.id, editBody); //TODO: fix this error
    return boletim;
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
