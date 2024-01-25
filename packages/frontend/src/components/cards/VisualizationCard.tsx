import React, { useEffect, useMemo, useState } from 'react';
import { Card, Select } from 'antd';
import { skipToken } from '@reduxjs/toolkit/dist/query/react';
import { useGetProjectBacklogHistoryQuery } from '../../api/backlog';
import { useGetSprintsByProjectIdQuery, Sprint } from '../../api/sprint';
import { Subheading } from '../typography';
import { withInjection } from '../../api/hooks/useInjector';

import './VisualizationCard.css';

export default function VisualizationCard({
  projectId,
  header,
  diagram,
}: {
  projectId: number | undefined;
  header: string;
  diagram: any;
}) {
  const { data: sprintsData } = useGetSprintsByProjectIdQuery(projectId ?? skipToken);
  const { data: backlogHistory } = useGetProjectBacklogHistoryQuery(projectId ? { projectId } : skipToken);
  const [sprintSelected, setSprintSelected] = useState<Sprint | undefined>();
  const Chart = withInjection(diagram);
  return (
    <Card className="visualization-card">
      <div className="visualization-card-header">
        <Subheading className="visualization-card-header-text">{header}</Subheading>
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
          // value={sprintSelected?.id}
          onSelect={(value: number) => {
            setSprintSelected(sprintsData?.sprints.find((s) => s.id === value));
          }}
        />
      </div>
      {sprintSelected ? (
        backlogHistory && <Chart sprint={sprintSelected} backlogHistory={backlogHistory} />
      ) : (
        <div>Please select a sprint to display</div>
      )}
    </Card>
  );
}
