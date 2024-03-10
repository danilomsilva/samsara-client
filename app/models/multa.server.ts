import type { User } from '~/session.server';
import { formatCurrency, formatDate, formatDateTime } from '~/utils/utils';

export type MultaResponse = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: Multa[];
};

export type Multa = {
  id?: string;
  created?: string;
  data_infracao?: string;
  codigo_infracao?: string;
  valor_infracao?: number | string;
  condutor?: string;
  equipamento?: string;
  modelo_equipamentoX?: string;
  pago?: string;
  inativo?: boolean;
  motivo?: string;
};

export async function getMultas(
  userToken: User['token'],
  sortingBy: string | null,
  filter?: string,
  page?: string,
  perPage?: string
): Promise<MultaResponse> {
  let url = `${process.env.BASE_API_URL}/collections/multa/records`;

  const queryParams = new URLSearchParams();
  queryParams.set('expand', 'equipamento,condutor');
  queryParams.set('sort', sortingBy ?? '');
  queryParams.set('page', page ?? '1');
  queryParams.set('perPage', perPage ?? '30');
  queryParams.set('filter', filter ?? '');

  if (queryParams.toString()) url += `?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
  });
  const data = await response.json();

  const transformedData = data.items.map((item) => {
    return {
      ...item,
      created: item?.created && formatDateTime(item.created),
      data_infracao: item?.data_infracao && formatDate(item.data_infracao),
      condutor: item.expand.condutor.nome_completo,
      equipamento: `${item.expand.equipamento.codigo} - ${item.expand.equipamento.modelo}`,
      valor_infracao: formatCurrency(Number(item.valor_infracao)),
    };
  });
  return { ...data, items: transformedData };
}

export async function getMulta(
  userToken: User['token'],
  multaId: string
): Promise<Multa> {
  const response = await fetch(
    `${process.env.BASE_API_URL}/collections/multa/records/${multaId}?expand=equipamento`,
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
}

export async function createMulta(userToken: User['token'], body: Multa) {
  const response = await fetch(
    `${process.env.BASE_API_URL}/collections/multa/records`,
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
}

export async function updateMulta(
  userToken: User['token'],
  multaId: string,
  body: Multa
) {
  const response = await fetch(
    `${process.env.BASE_API_URL}/collections/multa/records/${multaId}`,
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
}

export async function deleteMulta(userToken: User['token'], multaId: string) {
  const response = await fetch(
    `${process.env.BASE_API_URL}/collections/multa/records/${multaId}`,
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
}
