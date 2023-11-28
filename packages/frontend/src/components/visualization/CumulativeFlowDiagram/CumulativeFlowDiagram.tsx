import React, { useState, useEffect } from 'react';
import { Area } from '@ant-design/plots';
import { dateFormatter } from '../../../util/Formatters';
import { useAppSelector } from '../../../app/hooks';

type CumulativeFlowDiagramProps = {};

export function CumulativeFlowDiagram(props: CumulativeFlowDiagramProps): JSX.Element {
  const isDarkTheme = useAppSelector((state) => state.themeSlice.isDarkTheme);
  const [data, setData] = useState<Record<string, any>[]>([
    {
      type: 'Todo',
      date: new Date(2023, 11, 24),
      value: 1,
    },
    {
      type: 'Todo',
      date: new Date(2023, 11, 25),
      value: 2,
    },
    {
      type: 'Todo',
      date: new Date(2023, 11, 27),
      value: 5,
    },
    {
      type: 'Todo',
      date: new Date(2023, 11, 28),
      value: 11,
    },
    {
      type: 'Todo',
      date: new Date(2023, 11, 29),
      value: 9,
    },
  ]);
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
