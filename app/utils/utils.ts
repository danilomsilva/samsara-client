import { format } from 'date-fns';

export const formatDate = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const generateLastCodigo = (array: unknown) => {
  if (Array.isArray(array)) {
    const totalOfElements: number = array.length;
    return totalOfElements;
  }
};
