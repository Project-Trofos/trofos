import React from 'react';
import { ColumnConfig, Column } from '@ant-design/plots';
import { BacklogHistory } from '../../api/types';
import useDailyCompletedPoints from './useDailyCompletedBacklog';

export default function DailyCompletedPointsBarGraph(props: { backlogHistory: BacklogHistory[] }) {
  const { backlogHistory } = props;

  const data = useDailyCompletedPoints(backlogHistory);

  const config: ColumnConfig = {
    data,
    xField: 'date',
    yField: 'value',
    meta: {
      values: {
        alias: 'story points completed',
      },
    },
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Column {...config} />;
}
