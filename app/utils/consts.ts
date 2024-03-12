export type Option = {
  name: string;
  displayName: string;
};

export const TIPOS_ACESSO: Option[] = [
  { name: 'Administrador', displayName: 'Administrador' },
  { name: 'Encarregado', displayName: 'Encarregado' },
  { name: 'RH', displayName: 'Recursos Humanos' },
];

export const OPERADOR_ATIVIDADES: Option[] = [
  { name: 'Operador', displayName: 'Operador' },
  { name: 'Mecânico', displayName: 'Mecânico' },
];

export const COMBUSTIVEIS: Option[] = [
  { name: 'Diesel_S10', displayName: 'Diesel S10' },
  { name: 'Diesel_S500', displayName: 'Diesel S500' },
  { name: 'Gasolina', displayName: 'Gasolina' },
  { name: 'Etanol', displayName: 'Etanol' },
];

export const INSTRUMENTOS_MEDICAO: Option[] = [
  { name: 'Horímetro', displayName: 'Horímetro' },
  { name: 'Odômetro', displayName: 'Odômetro' },
];

export const TIPOS_MANUTENCAO: Option[] = [
  { name: 'Simples', displayName: 'Simples' },
  { name: 'Completa', displayName: 'Completa' },
];

export const TIPOS_REVISAO: Option[] = [
  { name: 'Revisão', displayName: 'Revisão' },
];

export const CAMPO_OBRIGATORIO = { message: 'Campo obrigatório' };

export type PaginationType = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};
