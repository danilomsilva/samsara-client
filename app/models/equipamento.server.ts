import type { User } from '~/session.server';
import { formatDateTime } from '~/utils/utils';
import { type Obra, getObra } from './obra.server';
import { type Usuario, getUsuario } from './usuario.server';
import { getEquipamentoTipo } from './equipamento_tipo.server';

export type GrupoEquipamento = {
  id?: string;
  created?: string;
  grupo_nome?: string;
};

export type TipoEquipamento = {
  id?: string;
  created?: string;
  tipo_nome?: string;
};

export type Equipamento = {
  id?: string;
  created?: string;
  codigo?: string;
  modelo?: string;
  numero_serie?: string;
  obra?: Obra;
  obraX?: string;
  valor_locacao_mensal?: string;
  valor_locacao_diario?: string;
  valor_locacao_hora?: string;
  tipo_equipamento?: string;
  tipo_equipamentoX?: string;
  grupo_equipamento?: string;
  grupo_equipamentoX?: string;
  ano?: string;
  combustivel?: string;
  encarregado?: Usuario;
  encarregadoX?: string;
  instrumento_medicao?: 'Odômetro' | 'Horímetro';
  instrumento_medicao_inicio?: string;
  instrumento_medicao_atual?: string;
  frequencia_revisao?: string;
  proxima_revisao?: string;
  revisao_IM_inicio?: string;
  revisao_status?: number;
  expand?: {
    obra: {
      nome: string;
    };
    encarregado?: {
      nome_completo: string;
    };
    tipo_equipamento?: {
      tipo_nome: string;
    };
    grupo_equipamento?: {
      grupo_nome: string;
    };
  };
  inativo?: boolean;
  motivo?: string;
};
export async function getGruposEquipamento(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/equipamento_grupo/records`;

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
        'Authorization': `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    const transformedData = data.items.map((item: GrupoEquipamento) => ({
      id: item.id,
      created: item?.created && formatDateTime(item.created),
      grupo_nome: item.grupo_nome,
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting grupos de equipamentos');
  }
}

export async function getTiposEquipamento(
  userToken: User['token'],
  sortingBy: string | null
) {
  let url = `${process.env.BASE_API_URL}/collections/equipamento_tipo/records`;

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
        'Authorization': `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    const transformedData = data.items.map((item: TipoEquipamento) => ({
      id: item.id,
      created: item?.created && formatDateTime(item.created),
      tipo_nome: item.tipo_nome,
    }));
    return transformedData;
  } catch (error) {
    throw new Error('An error occured while getting tipos de equipamentos');
  }
}

export async function getEquipamentos(
  userToken: User['token'],
  sortingBy: string | null,
  filter: string
) {
  let url = `${process.env.BASE_API_URL}/collections/equipamento/records`;

  const queryParams = new URLSearchParams();
  if (sortingBy) queryParams.set('sort', sortingBy);
  queryParams.set(
    'expand',
    'obra,encarregado,tipo_equipamento,grupo_equipamento'
  );
  // if (perPage) queryParams.set('perPage', perPage ?? '100'); //TODO: implement perPage
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

    const transformedData = data.items.map((item: Equipamento) => ({
      id: item.id,
      created: item?.created && formatDateTime(item.created),
      codigo: item.codigo,
      obra: item?.obra,
      obraX: item.obraX,
      valor_locacao_diario: item.valor_locacao_diario,
      valor_locacao_mensal: item.valor_locacao_mensal,
      valor_locacao_hora: item.valor_locacao_hora,
      tipo_equipamento: item.tipo_equipamento,
      tipo_equipamentoX: item?.tipo_equipamentoX,
      grupo_equipamento: item.grupo_equipamento,
      grupo_equipamentoX: item?.expand?.grupo_equipamento?.grupo_nome,
      numero_serie: item.numero_serie,
      modelo: item.modelo,
      ano: item.ano,
      combustivel: item.combustivel,
      encarregado: item?.encarregado,
      encarregadoX: item.encarregadoX,
      instrumento_medicao: item.instrumento_medicao,
      instrumento_medicao_inicio: item.instrumento_medicao_inicio,
      instrumento_medicao_atual: item.instrumento_medicao_atual,
      frequencia_revisao: item.frequencia_revisao,
      proxima_revisao: item.proxima_revisao,
      revisao_status: Number(item.revisao_status).toFixed(2),
      inativo: item?.inativo,
      motivo: item?.motivo,
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
          'Authorization': `Bearer ${userToken}`,
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
  if (equipamento.data) {
    return equipamento;
  } else {
    const { nome } = await getObra(userToken, equipamento.obra);
    const { nome_completo } = await getUsuario(
      userToken,
      equipamento.encarregado
    );

    const tipoEquipamento = await getEquipamentoTipo(
      userToken,
      body.tipo_equipamento as string
    );

    // REVISAO CALCULATIONS
    const diffToRevisao =
      Number(equipamento?.proxima_revisao) -
      Number(equipamento?.instrumento_medicao_atual);

    const editBody = {
      obraX: nome,
      encarregadoX: nome_completo,
      revisao_status: Number(diffToRevisao).toFixed(2),
      tipo_equipamentoX: tipoEquipamento.tipo_nome,
    };

    await updateEquipamento(userToken, equipamento.id, editBody);
    return equipamento;
  }
}

export async function createEquipamento(
  userToken: User['token'],
  body: Equipamento
) {
  const equipamentos = await getEquipamentos(userToken, 'created', '');
  const existingCodigo = equipamentos.some(
    (equip: Equipamento) => equip.codigo === body.codigo
  );
  if (existingCodigo) {
    return { data: 'Código existente' };
  } else {
    try {
      const response = await fetch(
        `${process.env.BASE_API_URL}/collections/equipamento/records`,
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
      throw new Error('An error occured while creating equipamento ');
    }
  }
}

export async function _updateEquipamento(
  userToken: User['token'],
  equipamentoId: string,
  body: Equipamento
) {
  const equipamento = await updateEquipamento(userToken, equipamentoId, body);
  const { nome } = await getObra(userToken, equipamento.obra);
  const { nome_completo } = await getUsuario(
    userToken,
    equipamento.encarregado
  );
  const tipoEquipamento = await getEquipamentoTipo(
    userToken,
    body.tipo_equipamento as string
  );

  const diffToRevisao =
    Number(equipamento?.proxima_revisao) -
    Number(body?.instrumento_medicao_atual);

  if (equipamento?.frequencia_revisao === Number(body?.frequencia_revisao)) {
    const editBody = {
      obraX: nome,
      encarregadoX: nome_completo,
      revisao_status: diffToRevisao.toFixed(2),
      proxima_revisao:
        Number(body?.frequencia_revisao) +
        Number(body?.instrumento_medicao_atual),
      tipo_equipamentoX: tipoEquipamento.tipo_nome,
    };

    await updateEquipamento(userToken, equipamento.id, editBody);
  } else {
    const editBody = {
      obraX: nome,
      encarregadoX: nome_completo,
      proxima_revisao:
        Number(body?.frequencia_revisao) +
        Number(body?.instrumento_medicao_atual),
      revisao_status: diffToRevisao.toFixed(2),
    };

    await updateEquipamento(userToken, equipamento.id, editBody);
  }

  return equipamento;
}

export async function updateEquipamento(
  userToken: User['token'],
  equipamentoId: string,
  body: Equipamento
) {
  try {
    const response = await fetch(
      `${process.env.BASE_API_URL}/collections/equipamento/records/${equipamentoId}`,
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
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('An error occured when deleting equipamento');
  }
}
