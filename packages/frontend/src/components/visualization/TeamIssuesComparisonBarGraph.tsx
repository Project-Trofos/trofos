import React, { useMemo } from 'react';
import { Empty } from 'antd';
import { ColumnConfig, Column } from '@ant-design/plots';
import { BacklogStatus, ProjectData } from '../../api/types';
import { Sprint } from '../../api/sprint';
import { useAppSelector } from '../../app/hooks';

export default function TeamIssuesComparisonBarGraph(props: { activeSprints: Sprint[]; projects: ProjectData[] }) {
  const { activeSprints, projects } = props;
  const isDarkTheme = useAppSelector((state) => state.themeSlice.isDarkTheme);
  const data = useMemo(() => {
    const toDosPerProject = projects.map((p) => {
      const backlogs = activeSprints.find((s) => s.project_id === p.id)?.backlogs;
      return {
        projectName: p.pname,
        value: backlogs?.filter((b) => b.status === BacklogStatus.TODO).length ?? 0,
        type: BacklogStatus.TODO,
      };
    });

    const donePerProject = projects.map((p) => {
      const backlogs = activeSprints.find((s) => s.project_id === p.id)?.backlogs;
      return {
        projectName: p.pname,
        value: backlogs?.filter((b) => b.status === BacklogStatus.DONE).length ?? 0,
        type: BacklogStatus.DONE,
      };
    });

    const inProgressPerProject = projects.map((p) => {
      const backlogs = activeSprints.find((s) => s.project_id === p.id)?.backlogs;
      return {
        projectName: p.pname,
        value: backlogs?.filter((b) => b.status !== BacklogStatus.DONE && b.status !== BacklogStatus.TODO).length ?? 0,
        type: 'In progress',
      };
    });

    return [...toDosPerProject, ...inProgressPerProject, ...donePerProject];
  }, [projects, activeSprints]);

  const config: ColumnConfig = {
    data,
    theme: isDarkTheme ? 'dark' : 'default',
    isStack: true,
    xField: 'projectName',
    yField: 'value',
    height: 300,
    seriesField: 'type',
  };

  if (data.length === 0) {
    return <Empty description="There are no completed issues in this sprint yet..." />;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Column {...config} />;
}
