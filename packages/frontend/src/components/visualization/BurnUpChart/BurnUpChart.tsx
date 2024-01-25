import React from 'react';
import { Line } from '@ant-design/plots';
import { BacklogHistory } from '../../../api/types';
import { Sprint } from '../../../api/sprint';
import { useBurnUp } from './useBurnUp';

type BurnUpChartProps = {
  backlogHistory: BacklogHistory[];
  sprint: Sprint | undefined;
};

export default function BurnUpChart(props: BurnUpChartProps): JSX.Element {
  const { backlogHistory, sprint } = props;
  const { storyPointData } = useBurnUp(backlogHistory, sprint?.id, sprint?.end_date);

  const config: React.ComponentProps<typeof Line> = {
    data: storyPointData,
    xField: 'date',
    yField: 'point',
    stepType: 'hv',
    meta: {
      date: {
        type: 'time',
      },
    },
  };

  if (!sprint) {
    return <div>Please select a sprint to display.</div>;
  }

  if (storyPointData.length === 0) {
    return <div>No data to display.</div>;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Line {...config} />;
}
