import React, { useState } from 'react';
import { Card, Select } from 'antd';
import { useGetProjectBacklogHistoryQuery } from '../../api/backlog';
import { useGetSprintsQuery, Sprint } from '../../api/sprint';
import { Subheading } from '../typography';
import { BurnDownChart } from '../visualization/BurnDownChart';

import './VisualizationCard.css';

export default function VisualizationCard({ projectId }: { projectId: number | undefined }) {
  const { data: sprintsData } = useGetSprintsQuery(projectId ?? -1);
  const { data: backlogHistory } = useGetProjectBacklogHistoryQuery({ projectId: projectId ?? -1 });
  const [sprintSelected, setSprintSelected] = useState<Sprint | undefined>();

  return (
    <Card className="visualization-card">
      <div className="visualization-card-header">
        <Subheading style={{ marginBottom: '30px' }}>Burn Down Chart</Subheading>
        <Select
          style={{ width: '140px' }}
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
