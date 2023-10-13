export type Option = {
  name: string;
  displayName: string;
};

export const TIPOS_ACESSO: Option[] = [
  { name: 'Administrador', displayName: 'Administrador' },
  { name: 'Encarregado', displayName: 'Encarregado' },
  { name: 'Gerente_de_Frota', displayName: 'Gerente de Frota' },
];

export const OPERADOR_ATIVIDADES: Option[] = [
  { name: 'Operador', displayName: 'Operador' },
  { name: 'Mecânico', displayName: 'Mecânico' },
];

export const TIPOS_LOCACAO: Option[] = [
  { name: 'Anual', displayName: 'Anual' },
  { name: 'Mensal', displayName: 'Mensal' },
  { name: 'Diária', displayName: 'Diária' },
  { name: 'Hora', displayName: 'Hora' },
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
  { name: 'Revisão', displayName: 'Revisão' },
];

export const CAMPO_OBRIGATORIO = { message: 'Campo obrigatório' };
