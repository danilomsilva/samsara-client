import { format, formatISO, isValid, parse, parseISO } from 'date-fns';

export const formatDateTime = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const formatDate = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy');
};

export const generateCodigo = (prefix: string, array: unknown) => {
  if (Array.isArray(array)) {
    const totalOfElements: number = array.length;
    return `${prefix}-${totalOfElements + 1}`;
  }
};

export const capitalizeWords = (string: string): string => {
  const capitalizedWords = string.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
    letter.toUpperCase()
  );
  return capitalizedWords;
};

export const convertDateToISO = (date: string) => {
  const newDate = formatISO(parse(date, 'dd/MM/yyyy', new Date()), {
    representation: 'date',
  });
  return newDate;
};

export const convertISOToDate = (iso: string) => {
  if (!isValid(parseISO(iso))) return;
  const date = iso.split(' ')[0].split('-');
  return `${date[2]}/${date[1]}/${date[0]}`;
};
