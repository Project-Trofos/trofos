import { format } from 'date-fns';

export const dateFormatter = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};
