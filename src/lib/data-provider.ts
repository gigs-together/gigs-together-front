import type { DataProvider } from 'react-admin';
import { fetchUtils } from 'react-admin';

const apiUrl = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL || '/api/admin';
const httpClient = fetchUtils.fetchJson;

export const dataProvider: DataProvider = {
  getList: (resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = 'id', order = 'ASC' } = params.sort || {};

    const query: Record<string, string> = {
      _sort: field,
      _order: order,
      _start: String((page - 1) * perPage),
      _end: String(page * perPage),
    };

    // Add search filter if present
    if (params.filter.q) {
      query.q = params.filter.q;
    }

    const url = `${apiUrl}/${resource}?${new URLSearchParams(query).toString()}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(headers.get('X-Total-Count') || '0', 10),
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: json,
    })),

  getMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${new URLSearchParams(query).toString()}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
  },

  getManyReference: (resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = 'id', order = 'ASC' } = params.sort || {};

    const query: Record<string, string> = {
      _sort: field,
      _order: order,
      _start: String((page - 1) * perPage),
      _end: String(page * perPage),
      [params.target]: String(params.id),
    };
    const url = `${apiUrl}/${resource}?${new URLSearchParams(query).toString()}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(headers.get('X-Total-Count') || '0', 10),
    }));
  },

  update: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  updateMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${new URLSearchParams(query).toString()}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: json,
    })),

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json })),

  deleteMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${new URLSearchParams(query).toString()}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json }));
  },
};
