import { api } from './api';

export const createTransaksi    = (data) => api.post('transaksi_create', data);
export const getRiwayatTransaksi = ()    => api.get('transaksi');