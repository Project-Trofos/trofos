import React, { useEffect, useState } from 'react';
import { Card, Select } from 'antd';
import { skipToken } from '@reduxjs/toolkit/dist/query/react';
import { useGetProjectBacklogHistoryQuery } from '../../api/backlog';
import { useGetSprintsByProjectIdQuery, Sprint } from '../../api/sprint';
import { Subheading } from '../typography';
import { BurnDownChart } from '../visualization/BurnDownChart';

import './VisualizationCard.css';

export default function VisualizationCard({ projectId }: { projectId: number | undefined }) {
  const { data: sprintsData } = useGetSprintsByProjectIdQuery(projectId ?? skipToken);
  const { data: backlogHistory } = useGetProjectBacklogHistoryQuery(projectId ? { projectId } : skipToken);
  const [sprintSelected, setSprintSelected] = useState<Sprint | undefined>();

  // Set default sprint to show burndown as the current sprint/ most recent sprint
  useEffect(() => {
    if (sprintsData) {
      const activeSprint = sprintsData.sprints.find((s) => s.status === 'current');
      if (activeSprint) {
        setSprintSelected(activeSprint);
      } else {
        const sprintsWithHighestId = sprintsData?.sprints.reduce((highest, current) => {
          return current.id > highest.id ? current : highest;
        }, sprintsData?.sprints[0]);
        setSprintSelected(sprintsWithHighestId);
      }
    }
  }, [sprintsData, projectId]);

  const options = [...(sprintsData?.sprints ?? [])].sort((s1, s2) => {
    return s2.id - s1.id; // sort id desc
  }).map((s) => {
    if (s.status === 'current') {
      return { value: s.id, label: `${s.name} (active)` };
    }
    return { value: s.id, label: s.name };
  });
  options.push({ value: -1, label: 'All sprints' });

  return (
    <Card className="visualization-card">
      <div className="visualization-card-header">
        <Subheading className="visualization-card-header-text">Burn Down Chart</Subheading>
        <Select
          className="visualization-card-selector"
          placeholder="Select a sprint"
          value={sprintSelected?.id ?? undefined}
          options={
            options ?? []
          }
          onSelect={(value: number) => {
            setSprintSelected(sprintsData?.sprints.find((s) => s.id === value));
          }}
        />
      </div>
      {backlogHistory && <BurnDownChart sprint={sprintSelected} backlogHistory={backlogHistory} />}
    </Card>
  );
}
