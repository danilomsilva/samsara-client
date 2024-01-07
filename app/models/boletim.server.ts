import type { User } from '~/session.server';
import { formatDate, formatDateTime, removeIMSuffix } from '~/utils/utils';
import {
  type Equipamento,
  getEquipamento,
  updateEquipamento,
} from './equipamento.server';
import { getUsuario } from './usuario.server';
import { getOperador } from './operador.server';
import { getObra } from './obra.server';
import {
  type Manutencao,
  _createManutencao,
  _updateManutencao,
  getManutencoes,
} from './manutencao.server';

export type EquipamentoLog = {
  index: string | number;
  OS: string;
  OP: string;
  hora_inicio: string;
  hora_final: string;
  IM_inicio: string;
  IM_final: string;
  isHoraValid?: boolean;
  isIMValid?: boolean;
  isRowValid?: boolean;
};

export type Boletim = {
  created?: string;
  updated?: string;
  id?: string;
  newCode?: string;
  codigo?: string;
  abastecimento_1?: string;
  abastecimento_2?: string;
  abastecimento_3?: string;
  data_boletim?: string;
  descricao_equipamento?: string;
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
  lastRowIMFinal?: string;
  total_abastecimento?: string;
  descricao_manutencao?: string;
  inativo?: boolean;
  motivo?: string;
};

export async function getBoletins(
  userToken: User['token'],
  sortingBy: string | null,
  filter: string
) {
  let url = `${process.env.BASE_API_URL}/collections/boletim/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);

  queryParams.set('perPage', '200'); //set max items per page when querying db
  queryParams.set('filter', filter ?? '');

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

    const transformedData = data.items.map((item: Boletim) => {
      return {
        id: item?.id,
        created: item?.created && formatDateTime(item.created),
        updated: item?.updated && formatDateTime(item.updated),
        data_boletim: item?.data_boletim && formatDate(item.data_boletim),
        codigo: item?.codigo,
        equipamento: item?.equipamento,
        equipamentoX: item?.equipamentoX,
        descricao_equipamento: item?.descricao_equipamento,
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
        encarregado: item?.encarregado,
        encarregadoX: item?.encarregadoX,
        total_abastecimento: item?.total_abastecimento,
        manutencao: item?.manutencao,
        lubrificacao: item?.lubrificacao,
        limpeza: item?.limpeza,
        inativo: item?.inativo,
        motivo: item?.motivo,
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
          'Authorization': `Bearer ${userToken}`,
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
      IM_inicioX: body.equipamento_logs?.find((log) => log.index === 0)
        ?.IM_inicio,
      IM_finalX:
        body?.equipamento_logs?.[body.equipamento_logs.length - 1]?.IM_final,
      total_abastecimento: `${
        Number(body?.abastecimento_1?.replace(' L', '')) +
          Number(body?.abastecimento_2?.replace(' L', '')) || '0'
      } L`,
    };

    await updateBoletim(userToken, boletim.id, editBody);
    await updateEquipamento(userToken, boletim.equipamento, {
      instrumento_medicao_atual: removeIMSuffix(body?.lastRowIMFinal as string),
      revisao_status:
        Number(equipamento?.proxima_revisao) -
        Number(removeIMSuffix(body?.lastRowIMFinal as string)),
    } as Equipamento);
    if (body?.manutencao) {
      await _createManutencao(userToken, {
        boletim: `BOL-${body?.newCode}`,
        tipo_manutencao: 'Simples',
        data_manutencao: body?.data_boletim,
        feito_por: body?.operador,
        equipamento: body?.equipamento,
        IM_atual: removeIMSuffix(body?.lastRowIMFinal as string),
        descricao: body?.descricao_manutencao,
      });
    }
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
          'Authorization': `Bearer ${userToken}`,
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
      IM_inicioX: body.equipamento_logs?.find((log) => log.index === 0)
        ?.IM_inicio,
      IM_finalX:
        body?.equipamento_logs?.[body.equipamento_logs.length - 1]?.IM_final,
      total_abastecimento: `${
        Number(body?.abastecimento_1?.replace(' L', '')) +
          Number(body?.abastecimento_2?.replace(' L', '')) || '0'
      } L`,
      manutencao: body.manutencao,
    };

    await updateBoletim(userToken, boletim.id, editBody);
    await updateEquipamento(userToken, boletim.equipamento, {
      instrumento_medicao_atual: removeIMSuffix(body?.lastRowIMFinal as string),
      revisao_status:
        Number(equipamento?.proxima_revisao) -
        Number(removeIMSuffix(body?.lastRowIMFinal as string)),
    } as Equipamento);

    const manutencoes = await getManutencoes(userToken, 'created', '');
    const findManutencao = manutencoes.find(
      (item: Manutencao) => item.boletim === boletim.codigo
    );
    if (findManutencao) {
      await _updateManutencao(userToken, findManutencao.id, {
        tipo_manutencao: 'Simples',
        data_manutencao: body?.data_boletim,
        feito_por: body?.operador,
        equipamento: body?.equipamento,
        IM_atual: removeIMSuffix(body?.lastRowIMFinal as string),
        descricao: body?.descricao_manutencao,
      });
    } else if (body?.manutencao) {
      await _createManutencao(userToken, {
        boletim: boletim.codigo,
        tipo_manutencao: 'Simples',
        data_manutencao: body?.data_boletim,
        feito_por: body?.operador,
        equipamento: body?.equipamento,
        IM_atual: removeIMSuffix(body?.lastRowIMFinal as string),
        descricao: body?.descricao_manutencao,
      });
    }

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
          'Authorization': `Bearer ${userToken}`,
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
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured while deleting boletim');
  }
}
