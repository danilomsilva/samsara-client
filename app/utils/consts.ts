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

export const GRUPOS_EQUIPAMENTOS: Option[] = [
  { name: 'Automóvel', displayName: 'Automóvel' },
  { name: 'Caminhão', displayName: 'Caminhão' },
  { name: 'Máquina', displayName: 'Máquina' },
  { name: 'Outros', displayName: 'Outros' },
];

export const TIPOS_EQUIPAMENTOS: Option[] = [
  { name: 'Carregadeira_de_Rodas', displayName: 'Carregadeira de Rodas' },
  { name: 'Caminhão_Basculante', displayName: 'Caminhão Basculante' },
  { name: 'Caminhão_Espargidor', displayName: 'Caminhão Espargidor' },
  { name: 'Caminhão_Pipa', displayName: 'Caminhão Pipa' },
  { name: 'Escavadeira_Hidráulica', displayName: 'Escavadeira Hidráulica' },
  {
    name: 'Máquina_Extrusora_de_Guias',
    displayName: 'Máquina Extrusora de Guias',
  },
  { name: 'Mini_Carregadeira', displayName: 'Mini Carregadeira' },
  { name: 'Motoniveladora', displayName: 'Motoniveladora' },
  { name: 'Rolos_Chapa_Pneu', displayName: 'Rolos Chapa Pneu' },
  { name: 'Rolo_Pé_de_Carneiro', displayName: 'Rolo Pé de Carneiro' },
  { name: 'Trator_de_Reboque', displayName: 'Trator de Reboque' },
  { name: 'Trator_de_Esteiras', displayName: 'Trator de Esteiras' },
  { name: 'Vibro_Acabadora', displayName: 'Vibro Acabadora' },
];

export const TIPOS_LOCACAO: Option[] = [
  { name: 'Anual', displayName: 'Anual' },
  { name: 'Mensal', displayName: 'Mensal' },
  { name: 'Diário', displayName: 'Diário' },
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
