import React, { useState, useEffect } from 'react';
import { Area } from '@ant-design/plots';
import { dateFormatter } from '../../../util/Formatters';
import { useAppSelector } from '../../../app/hooks';
import useCummulativeFlow from './useCumulativeFlow';
import { BacklogHistory } from '../../../api/types';

export function CumulativeFlowDiagram(props: { backlogHistory: BacklogHistory[] }): JSX.Element {
  const { backlogHistory } = props;
  const isDarkTheme = useAppSelector((state) => state.themeSlice.isDarkTheme);
  const data = useCummulativeFlow(backlogHistory);
  // const [data, setData] = useState<Record<string, any>[]>([
  //   {
  //     type: 'Todo',
  //     date: new Date(2023, 11, 24, 4, 10, 23),
  //     value: 1,
  //   },
  //   {
  //     type: 'Doing',
  //     date: new Date(2023, 11, 24, 4, 10, 23),
  //     value: 0,
  //   },
  //   {
  //     type: 'Todo',
  //     date: new Date(2023, 11, 25, 4, 10, 23),
  //     value: 2,
  //   },
  //   {
  //     type: 'Todo',
  //     date: new Date(2023, 11, 27, 4, 10, 23),
  //     value: 5,
  //   },
  //   {
  //     type: 'Todo',
  //     date: new Date(2023, 11, 28, 4, 10, 23),
  //     value: 11,
  //   },
  //   {
  //     type: 'Doing',
  //     date: new Date(2023, 11, 29, 1, 10, 23),
  //     value: 1,
  //   },
  //   {
  //     type: 'Doing',
  //     date: new Date(2023, 11, 29, 10, 10, 23),
  //     value: 2,
  //   },
  // ]);
  const config: React.ComponentProps<typeof Area> = {
    data: data,
    theme: isDarkTheme ? 'dark' : 'default',
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    slider: { formatter: dateFormatter },
    meta: {
      date: {
        alias: 'Date',
        type: 'timeCat', // important to use this specific type.
        formatter: dateFormatter,
      },
      value: {
        alias: 'Number of Issues',
      },
    },
  };

  if (data.length === 0) {
    return <div>No data to display.</div>;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Area {...config} />;
}
