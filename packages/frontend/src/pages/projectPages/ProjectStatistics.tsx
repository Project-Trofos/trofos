import { useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/dist/query/react';
import { Card, Divider, Empty, Segmented, Select, Space } from 'antd';
import { useProjectIdParam } from '../../api/hooks';
import { useGetSprintsByProjectIdQuery } from '../../api/sprint';
import Container from '../../components/layouts/Container';
import { useGetProjectBacklogHistoryQuery } from '../../api/backlog';
import { BurnDownChart } from '../../components/visualization/BurnDownChart';
import { Subheading } from '../../components/typography';
import BacklogTable from '../../components/tables/BacklogTable';
import SprintSummaryCard from '../../components/cards/SprintSummaryCard';
import { useGetProjectQuery } from '../../api/project';
import ProjectSummaryCard from '../../components/cards/ProjectSummaryCard';

export default function ProjectStatistics(): JSX.Element {
  const projectId = useProjectIdParam();
  const { data: project } = useGetProjectQuery({ id: projectId });
  const { data: sprintsData } = useGetSprintsByProjectIdQuery(project?.id ?? skipToken);
  const { data: backlogHistory } = useGetProjectBacklogHistoryQuery(
    project?.id ? { projectId: project.id } : skipToken,
  );

  const [selectedUser, setSelectedUser] = useState<{ id: number; displayName: string }>();
  const [sprintId, setSprintId] = useState<number>();
  const [segment, setSegment] = useState<'Overall' | 'By Sprint'>('Overall');

  const selectedSprint = useMemo(() => {
    return sprintsData?.sprints.find((s) => s.id === sprintId);
  }, [sprintsData, sprintId]);

  const selectedUserHistory = useMemo(() => {
    if (!backlogHistory || !selectedSprint) {
      return [];
    }
    return backlogHistory.filter((b) => b.assignee_id === selectedUser?.id && b.sprint_id === selectedSprint.id);
  }, [backlogHistory, selectedUser, selectedSprint]);

  return (
    <Container>
      <Card>
        <Space direction="vertical">
          Select and option to see contribution breakdown
          <Segmented
            options={['Overall', 'By Sprint']}
            onResize={undefined}
            onResizeCapture={undefined}
            onChange={(e) => setSegment(e as 'Overall' | 'By Sprint')}
          />
          {segment === 'By Sprint' && (
            <Space>
              <Select
                placeholder="Select sprint"
                value={selectedSprint?.id}
                options={project?.sprints.map((s) => {
                  return {
                    value: s.id,
                    label: s.name,
                  };
                })}
                onSelect={(id) => setSprintId(id)}
              />
            </Space>
          )}
        </Space>
      </Card>
      {segment === 'Overall' && sprintsData && project && (
        <>
          <ProjectSummaryCard />
          <Card>
            <BacklogTable
              heading="All Issues"
              backlogs={sprintsData.sprints.flatMap((s) => s.backlogs)}
              users={project?.users}
              projects={project ? [project] : undefined}
            />
          </Card>
        </>
      )}

      {segment === 'By Sprint' && (
        <>
          <SprintSummaryCard sprint={selectedSprint} />
          {selectedSprint && backlogHistory && (
            <Card>
              <BacklogTable
                control={
                  <Select
                    style={{ width: '200px' }}
                    placeholder="Select user"
                    value={selectedUser?.id}
                    options={project?.users.map((u) => {
                      return {
                        value: u.user.user_id,
                        label: u.user.user_display_name,
                      };
                    })}
                    onSelect={(_, { value, label }) => setSelectedUser({ id: value, displayName: label })}
                  />
                }
                backlogs={selectedSprint.backlogs.filter((b) => b.assignee_id === selectedUser?.id)}
                users={project?.users}
                projects={project ? [project] : undefined}
                heading="User Assigned Issues"
              />
              <Divider />
              <Subheading style={{ marginBottom: '30px' }}>User Burndown Chart</Subheading>
              {selectedUserHistory.length > 0 ? (
                <BurnDownChart backlogHistory={selectedUserHistory} sprint={selectedSprint} />
              ) : (
                <Empty />
              )}
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
