import dayjs from 'dayjs';

export const formatDbTimestamp = (timestamp: string): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

export const formatDbDate = (date: Date | null): string => {
  if (!date) {
    return '';
  }
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};
