import { format } from 'date-fns';

export const formatDate = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const generateCodigo = (prefix: string, array: unknown) => {
  if (Array.isArray(array)) {
    const totalOfElements: number = array.length;
    return `${prefix}-${totalOfElements + 1}`;
  }
};
