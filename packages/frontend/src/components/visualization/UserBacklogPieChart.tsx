import React from 'react';
import { Empty } from 'antd';
import { Pie } from '@ant-design/plots';
import { Sprint } from '../../api/sprint';
import { BacklogStatus, UserData } from '../../api/types';
import useGroupUserBacklog from './useGroupUserBacklog';

// A pie chart to display the number of backlogs of each user
export default function UserBacklogPieChart(props: {
  sprints: Sprint[];
  users: UserData[];
  // Defaults to true
  includeIncompleteIssues?: boolean;
}) {
  const { sprints, users, includeIncompleteIssues = false } = props;
  // Only look at completed backlogs
  const data = useGroupUserBacklog(
    includeIncompleteIssues
      ? sprints
      : sprints.map((s) => ({ ...s, backlogs: s.backlogs.filter((b) => b.status === BacklogStatus.DONE) })),
    users,
  );

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
    return <Empty style={{ flex: '1' }} description="No completed issues in this sprint..." />;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Pie {...config} />;
}
