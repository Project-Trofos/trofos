import { Card, Space, Table } from "antd";
import { CourseProjectsLatestInsights } from "../../api/types";

export default function CourseRetrospectiveInsightHubCard({
  projectsLatestInsights,
  projectIdsWithUnseenLatestSprintInsights,
}: {
  projectsLatestInsights: CourseProjectsLatestInsights[],
  projectIdsWithUnseenLatestSprintInsights: number[],
}): JSX.Element {
  const columns = [
    {
      title: 'Project ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Project Name',
      dataIndex: 'pname',
      key: 'pname',
    },
  ];
  return (
    <Card>
      <Space direction="vertical" size="large">
        <Table
          dataSource={projectsLatestInsights}
          columns={columns}
          bordered
          title={() => "Projects' latest sprint's insights"}
          footer={() => 'Footer'}
        />
      </Space>
    </Card>
  );
}
