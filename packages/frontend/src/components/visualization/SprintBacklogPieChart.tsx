import React from 'react';
import { Pie } from '@ant-design/plots';
import { Sprint } from '../../api/sprint';
import { Backlog } from '../../api/types';
import useGroupSprintBacklog from './useGroupSprintBacklog';

export default function SprintBacklogPieChart(props: { sprint: Sprint; unassignedBacklog: Backlog[] }) {
  const { sprint, unassignedBacklog } = props;
  const data = useGroupSprintBacklog(sprint, unassignedBacklog);

  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'inner',
      content: '{percentage}',
      autoRotate: false,
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Pie {...config} />;
}
