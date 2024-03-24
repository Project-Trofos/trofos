import React from 'react';
import Container from '../layouts/Container';
import { Card, Typography } from 'antd';
import ProjectSummaryCard from '../cards/ProjectSummaryCard';
import UserTable from '../tables/UserTable';
import { useProjectIdParam } from '../../api/hooks';
import { useGetProjectQuery } from '../../api/project';
import { useGetProjectUserRolesQuery } from '../../api/role';

type ReportStatisticsSectionProps = {};

const ReportStatisticsSection: React.FC<ReportStatisticsSectionProps> = () => {
  const projectId: number = useProjectIdParam();
  const { data: project, isLoading } = useGetProjectQuery({ id: projectId });
  const { data: userRoles } = useGetProjectUserRolesQuery(projectId);

  return (
    <Container noGap>
      <Typography.Title>Project Overview</Typography.Title>
      <Card style={{ marginBottom: '30px' }}>
        <UserTable
          heading="Users"
          users={project?.users}
          userRoles={userRoles}
          isLoading={isLoading}
          pagination={false}
        />
      </Card>
      <ProjectSummaryCard />
    </Container>
  );
};

export default ReportStatisticsSection;
