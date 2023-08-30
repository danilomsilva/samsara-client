export type Option = {
  name: string;
  displayName: string;
};

export const TIPOS_ACESSO: Option[] = [
  { name: 'administrador', displayName: 'Administrador' },
  { name: 'encarregado', displayName: 'Encarregado' },
  { name: 'gerente_frota', displayName: 'Gerente de Frota' },
];
