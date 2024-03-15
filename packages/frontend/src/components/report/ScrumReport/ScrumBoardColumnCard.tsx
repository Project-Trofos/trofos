import React from 'react';
import { Alert, message, Typography, Card, Space } from 'antd';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

import { useUpdateBacklogMutation } from '../../../api/backlog';
import { useGetBacklogStatusQuery, useGetProjectQuery } from '../../../api/project';
import { Backlog, BacklogUpdatePayload, ScrumBoardUserData } from '../../../api/types';
import ScrumBoardCard from '../../cards/ScrumBoardCard';
import StrictModeDroppable from '../../dnd/StrictModeDroppable';
import { Sprint } from '../../../api/sprint';

const { Title } = Typography;

type ScrumBoardColumnCardProps = { projectId: number; sprint?: Sprint; readonly?: boolean };

export default function ScrumBoardColumnCard({ projectId, sprint, readonly }: ScrumBoardColumnCardProps): JSX.Element {
  return (
    <Card bodyStyle={{ padding: 8 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {backlogs
          ?.filter((backlog) => backlog.status === status.name && backlog.assignee_id === userId)
          ?.map((backlog, index) => (
            <ScrumBoardCard key={backlog.backlog_id} backlog={backlog} projectKey={projectData?.pkey} id={index} />
          ))}
      </Space>
    </Card>
  );
}
