import dayjs from 'dayjs';

export const formatDbTimestamp = (timestamp: string): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};
