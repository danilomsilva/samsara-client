import {
  format,
  formatISO,
  isBefore,
  isValid,
  parse,
  parseISO,
} from 'date-fns';

//codigo
export const generateCodigo = (prefix: string, array: unknown) => {
  if (Array.isArray(array)) {
    const totalOfElements: number = array.length;
    return `${prefix}-${totalOfElements + 1}`;
  }
};

// DATE FUNCTIONS
export const formatDateTime = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const formatDate = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy');
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

export const isDateBefore = (date1: string, date2: string): boolean => {
  const parsedDate1 = parse(date1, 'dd/MM/yyyy', new Date());
  const parsedDate2 = parse(date2, 'dd/MM/yyyy', new Date());
  return isBefore(parsedDate1, parsedDate2);
};

// CURRENCY
export const convertCurrencyStringToNumber = (
  currencyString: string
): string | null | undefined => {
  if (currencyString.startsWith('R$ ')) {
    const str = currencyString
      .replace('R$', '')
      .replaceAll('.', '')
      .replaceAll(',', '');

    const result = `${str.slice(0, -2)}.${str.slice(-2)}`;
    return result;
  } else {
    return null;
  }
};

export const formatCurrency = (value: number): string => {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
  return formatter.format(value);
};

// STRING
export const capitalizeWords = (string: string): string => {
  const capitalizedWords = string.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
    letter.toUpperCase()
  );
  return capitalizedWords;
};

export const normalizeString = (string: string) =>
  string
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const removeIMSuffix = (string: string) => {
  return string?.replace(' h', '')?.replace(' Km', '')?.replaceAll('.', '');
};
