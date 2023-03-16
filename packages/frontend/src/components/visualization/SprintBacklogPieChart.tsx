import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Empty } from 'antd';
import { Pie } from '@ant-design/plots';
import { Sprint } from '../../api/sprint';
import { Backlog } from '../../api/types';
import useGroupSprintBacklog from './useGroupSprintBacklog';

export default function SprintBacklogPieChart(props: {
  sprints: Sprint[];
  unassignedBacklog: Backlog[];
  showButton?: boolean;
}) {
  const { sprints, unassignedBacklog, showButton } = props;
  const data = useGroupSprintBacklog(sprints, unassignedBacklog);
  const navigate = useNavigate();

  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    height: 300,
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

  if (data.length === 0) {
    return (
      <Empty style={{ flex: '1' }} description="You have no issues in the current sprint...">
        {showButton && (
          <Button type="primary" onClick={() => navigate('../sprint')}>
            View Sprint
          </Button>
        )}
      </Empty>
    );
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Pie {...config} />;
}
