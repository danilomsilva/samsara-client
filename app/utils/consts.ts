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
