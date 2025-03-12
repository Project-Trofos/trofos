import { useParams } from 'react-router-dom';
import { useGetAssignedIssuesByProjectIdQuery, useGetReportedIssuesByProjectIdQuery } from '../../api/project';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';
import { Heading } from '../../components/typography';
import { Space, Button, Tabs } from 'antd';
import IssuesTable from '../../components/tables/IssuesTable';
import IssueModal from '../../components/modals/IssueModal';

export default function ProjectIssues(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: assignedIssues, isLoading: loadingAssigned } = useGetAssignedIssuesByProjectIdQuery(projectId);
  const { data: reportedIssues, isLoading: loadingReported } = useGetReportedIssuesByProjectIdQuery(projectId);

  return (
    <GenericBoxWithBackground>
      <Space align="center">
        <Heading>Issues</Heading>
        <IssueModal />
      </Space>

      <Tabs defaultActiveKey="assigned">
        <Tabs.TabPane tab="Assigned TO this project" key="assigned">
          <IssuesTable issues={assignedIssues} loading={loadingAssigned} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Assigned BY this project" key="reported">
          <IssuesTable issues={reportedIssues} loading={loadingReported} assignedBy />
        </Tabs.TabPane>
      </Tabs>
    </GenericBoxWithBackground>
  );
}
