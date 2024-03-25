import React, { useMemo } from 'react';
import { Empty } from 'antd';
import { ColumnConfig, Column } from '@ant-design/plots';
import { Sprint } from '../../api/sprint';
import { useAppSelector } from '../../app/hooks';

export default function VelocityGraph(props: { sprints: Sprint[] }) {
  const isDarkTheme = useAppSelector((state) => state.themeSlice.isDarkTheme);
  const { sprints } = props;
  const sortedSprints = useMemo(() => [...sprints].sort((a: Sprint, b: Sprint) => b.id - a.id), [sprints]);
  const data = useMemo(() => {
    const commitmentBySprint = sortedSprints.map((s) => ({
      sprintName: s.name,
      value: s.backlogs.reduce((n, b) => n + (b.points ?? 0), 0),
      type: 'Commitment',
    }));

    const doneBySprint = sortedSprints.map((s) => ({
      sprintName: s.name,
      value: s.backlogs.filter((b) => b.status === 'Done').reduce((n, b) => n + (b.points ?? 0), 0),
      type: 'Completed',
    }));

    return [...commitmentBySprint, ...doneBySprint];
  }, [sortedSprints]);

  const config: ColumnConfig = {
    data,
    theme: isDarkTheme ? 'dark' : 'default',
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
