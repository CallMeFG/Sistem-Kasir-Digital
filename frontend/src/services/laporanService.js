import { api } from './api';

export const getLaporan = (bulan, tahun) => {
  return api.get(`laporan&bulan=${bulan}&tahun=${tahun}`);
};
