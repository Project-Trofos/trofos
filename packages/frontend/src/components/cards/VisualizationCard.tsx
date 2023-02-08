import React, { useState } from 'react';
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

  return (
    <Card className="visualization-card">
      <div className="visualization-card-header">
        <Subheading className="visualization-card-header-text">Burn Down Chart</Subheading>
        <Select
          className="visualization-card-selector"
          placeholder="Select a sprint"
          options={
            sprintsData?.sprints.map((s) => {
              if (s.status === 'current') {
                return { value: s.id, label: `${s.name} (active)` };
              }
              return { value: s.id, label: s.name };
            }) ?? []
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
