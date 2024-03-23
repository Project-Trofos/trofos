import React from 'react';
import { Typography, Card, Space } from 'antd';

import { useGetBacklogStatusQuery, useGetProjectQuery } from '../../../api/project';
import { Backlog, ScrumBoardUserData } from '../../../api/types';
import { ReadOnlyScrumBoardCard } from '../../cards/ScrumBoardCard';
import { Sprint } from '../../../api/sprint';
import { useProjectIdParam } from '../../../api/hooks';
import { Heading } from '../../typography';

const { Title } = Typography;

type ReportScrumBoardProps = { sprint?: Sprint };

export default function ReportScrumBoard({ sprint }: ReportScrumBoardProps): JSX.Element {
  const projectId = useProjectIdParam();
  const { data: backlogStatus } = useGetBacklogStatusQuery({ id: projectId });
  const { data: projectData } = useGetProjectQuery({ id: projectId });

  const processBacklogs = (backlogs?: Backlog[]) => {
    if (!backlogs) {
      return undefined;
    }

    return [...backlogs].sort((b1, b2) => b1.backlog_id - b2.backlog_id);
  };

  // Add a placeholder user for the unassigned backlogs
  const addUnassignedUser = (users: ScrumBoardUserData[] | undefined) => {
    if (!users) {
      return [];
    }

    const updatedUsers = [...users];
    const unassignedUser = { user: { user_id: null, user_email: 'Unassigned', user_display_name: 'Unassigned' } };
    updatedUsers.push(unassignedUser);
    return updatedUsers;
  };

  const backlogs = processBacklogs(sprint?.backlogs);
  const users = addUnassignedUser(projectData?.users);

  return (
    <Card style={{ marginBottom: '30px' }}>
      <Heading style={{ marginLeft: '10px' }}>{sprint?.name} Board</Heading>
      <div className="scrum-board-status-container">
        {backlogStatus?.map((status) => (
          <Card bodyStyle={{ padding: '0' }} key={status.name} className="scrum-board-status">
            <Title level={5}>{status.name} </Title>
          </Card>
        ))}
      </div>
      {users.map((user) => (
        <div key={user.user.user_id} className="scrum-board-user-container">
          <Title className="scrum-board-user-title" level={5}>
            {user.user.user_display_name}
          </Title>
          <div className="scrum-board-droppable">
            {backlogStatus?.map((status) => (
              <Card key={status.name} bodyStyle={{ padding: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {backlogs
                    ?.filter((backlog) => backlog.status === status.name && backlog.assignee_id === user.user.user_id)
                    ?.map((backlog) => (
                      <ReadOnlyScrumBoardCard
                        key={backlog.backlog_id}
                        backlog={backlog}
                        projectKey={projectData?.pkey}
                      />
                    ))}
                </Space>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}
