import { api } from './api';

export const getProduk     = ()     => api.get('produk');
export const createProduk  = (data) => api.post('produk_create', data);
export const updateProduk  = (data) => api.post('produk_update', data);
export const deleteProduk  = (id)   => api.post('produk_delete', { id });
export const restockProduk = (id, tambahan) => api.post('produk_restock', { id, tambahan });