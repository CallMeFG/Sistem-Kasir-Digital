import { api } from './api';

export const getBarang     = ()     => api.get('produk');
export const createBarang  = (data) => api.post('produk_create', data);
export const updateBarang  = (data) => api.post('produk_update', data);
export const deleteBarang  = (id)   => api.post('produk_delete', { id });
export const restockBarang = (id, tambahan) => api.post('produk_restock', { id, tambahan });