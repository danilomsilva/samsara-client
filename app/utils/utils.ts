import 'jspdf-autotable';
import {
  add,
  format,
  formatISO,
  isAfter,
  isBefore,
  isEqual,
  isValid,
  isWithinInterval,
  parse,
  parseISO,
} from 'date-fns';
import jsPDF from 'jspdf';

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

export const convertToReverseDate = (date: string) => {
  const parts = date.split('/');
  const originalDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  const formattedDate = format(originalDate, 'yyyy-MM-dd');
  return formattedDate;
};

export const isDateBefore = (date1: string, date2: string): boolean => {
  const parsedDate1 = parse(date1, 'dd/MM/yyyy', new Date());
  const parsedDate2 = parse(date2, 'dd/MM/yyyy', new Date());
  return isBefore(parsedDate1, parsedDate2);
};

export const getCurrentDate = () => {
  const today = new Date();
  return format(today, 'dd/MM/yyyy');
};

export const getTomorrowDate = () => {
  const today = new Date();
  const tomorrow = add(today, { days: 1 });
  return format(tomorrow, 'dd/MM/yyyy');
};

export const checkDateValid = (date: string) => {
  if (!date || date?.includes('_')) return true;
  const parsedDate = parse(date, 'dd/MM/yyyy', new Date());

  if (!isValid(parsedDate)) {
    return false;
  }

  const startDate = new Date(2000, 0, 1); // January 1, 2000
  const endDate = new Date(2030, 11, 31); // December 31, 2030

  return isWithinInterval(parsedDate, { start: startDate, end: endDate });
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

export const formatNumberWithDotDelimiter = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
  return string
    ?.replace(' h', '')
    ?.replace(' km', '')
    ?.replaceAll('.', '')
    .replaceAll(',', '.');
};

export const genCodigo = (array: any, prefixToOmit: string) => {
  if (!array.length) return 1;
  const cleanArray = array.map((item: any) =>
    Number(item.codigo.replace(prefixToOmit, ''))
  );
  const findMaxValue = Math.max(...cleanArray);
  return findMaxValue + 1;
};

export function isTimeGreater(time_1: string, time_2: string): boolean {
  const parsedTime_1 = parse(time_1, 'HH:mm', new Date());
  const parsedTime_2 = parse(time_2, 'HH:mm', new Date());

  if (
    isAfter(parsedTime_2, parsedTime_1) ||
    isEqual(parsedTime_2, parsedTime_1)
  ) {
    return true;
  }
  return false;
}

export function isDateGreater(date_1: string, date_2: string): boolean {
  const parsedDate_1 = parse(date_1, 'dd/MM/yyyy', new Date());
  const parsedDate_2 = parse(date_2, 'dd/MM/yyyy', new Date());
  if (isAfter(parsedDate_2, parsedDate_1)) {
    return true;
  }
  return false;
}

//PDF functions
export const exportPDF = (title: string, tableName: string) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.text(title, 15, 10);
  doc.autoTable({
    html: `#table-${tableName}`,
  });
  doc.save(`${tableName}_${getCurrentDate()}`);
};
