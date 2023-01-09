import React from 'react';
import { Tag } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

export type TimestampProps = {
  createdAt: string | Dayjs;
  updatedAt: string | Dayjs | undefined;
};

export default function Timestamp(props: TimestampProps) {
  const { createdAt, updatedAt } = props;

  const createdAtDayjs: Dayjs = typeof createdAt === 'string' ? dayjs(createdAt) : createdAt;
  const updatedAtDayjs: Dayjs | undefined = typeof updatedAt === 'string' ? dayjs(updatedAt) : updatedAt;

  return (
    <div>
      {updatedAtDayjs ? (
        <div>
          {updatedAtDayjs.format('DD/MM/YYYY HH:mm')} <Tag>Edited</Tag>
        </div>
      ) : (
        <div>{createdAtDayjs.format('DD/MM/YYYY HH:mm')}</div>
      )}
    </div>
  );
}
