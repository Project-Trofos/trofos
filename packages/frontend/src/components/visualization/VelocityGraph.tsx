import React, { useMemo } from 'react';
import { Empty } from 'antd';
import { ColumnConfig, Column } from '@ant-design/plots';
import { Sprint } from '../../api/sprint';

export default function VelocityGraph(props: { sprints: Sprint[] }) {
  const { sprints } = props;

  const data = useMemo(() => {
    const commitmentBySprint = sprints.map((s) => ({
      sprintName: s.name,
      value: s.backlogs.length,
      type: 'Commitment',
    }));

    const doneBySprint = sprints.map((s) => ({
      sprintName: s.name,
      value: s.backlogs.filter((b) => b.status === 'Done').length,
      type: 'Completed',
    }));

    return [...commitmentBySprint, ...doneBySprint];
  }, [sprints]);

  const config: ColumnConfig = {
    data,
    isGroup: true,
    xField: 'sprintName',
    yField: 'value',
    seriesField: 'type',
    maxColumnWidth: 50,
  };

  if (data.length === 0) {
    return <Empty description="There are no completed issues..." />;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Column {...config} />;
}
