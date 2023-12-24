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
  const config: React.ComponentProps<typeof Area> = {
    data: data,
    theme: isDarkTheme ? 'dark' : 'default',
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    meta: {
      date: {
        alias: 'Date',
        type: 'time', // important to use this specific type.
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
