import React, { useState } from 'react';
import { Empty, Space, Switch } from 'antd';
import { Pie } from '@ant-design/plots';
import { Sprint } from '../../api/sprint';
import { BacklogStatus, UserData } from '../../api/types';
import useGroupUserBacklog from './useGroupUserBacklog';
import { Subheading } from '../typography';
import { useAppSelector } from '../../app/hooks';

// A pie chart to display the number of backlogs of each user
export default function UserBacklogPieChart(props: {
  sprints: Sprint[];
  users: UserData[];
  toggleableIncomplete?: boolean;
  includeTitle?: boolean;
}) {
  const { sprints, users, toggleableIncomplete: includeIncompleteIssues, includeTitle } = props;
  const [includeIncomplete, setIncludeIncomplete] = useState<boolean>(false);
  const isDarkTheme = useAppSelector((state) => state.themeSlice.isDarkTheme);

  // Only look at completed backlogs
  const data = useGroupUserBacklog(
    includeIncomplete
      ? sprints
      : sprints.map((s) => ({ ...s, backlogs: s.backlogs.filter((b) => b.status === BacklogStatus.DONE) })),
    users,
  );

  const config = {
    data,
    theme: isDarkTheme ? 'dark' : 'default',
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
  return (
    <>
      {includeIncompleteIssues && (
        <Space>
          <div>Include Incomplete</div>
          <Switch title="Include Imcomplete" onChange={(e) => setIncludeIncomplete(e)} checked={includeIncomplete} />
        </Space>
      )}
      {includeTitle && <Subheading style={{ textAlign: 'center' }}>Contribution by Story Points</Subheading>}

      <Pie {...config} />
    </>
  );
}
