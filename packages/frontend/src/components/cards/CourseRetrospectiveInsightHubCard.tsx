import { Button, Card, Empty, Modal, Space, Table, Tabs, Typography } from "antd";
import { CourseProjectsLatestInsights, SprintInsight } from "../../api/types";
import { formatDbDate } from "../../helpers/dateFormatter";
import { useState } from "react";
import { Insight } from "../modals/SprintInsightModal";

export default function CourseRetrospectiveInsightHubCard({
  projectsLatestInsights,
  projectIdsWithUnseenLatestSprintInsights,
}: {
  projectsLatestInsights: CourseProjectsLatestInsights[],
  projectIdsWithUnseenLatestSprintInsights: number[],
}): JSX.Element {
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CourseProjectsLatestInsights | null>(null);

  const onCellExpandIfNoSprints = (record: CourseProjectsLatestInsights, index: number) => {
    if (!record.sprints || record.sprints.length === 0) {
      return { colSpan: 5 };
    }
    return {};
  }
  const onCellCollapseIfNoSprints = (record: CourseProjectsLatestInsights, index: number) => {
    if (!record.sprints || record.sprints.length === 0) {
      return { colSpan: 0 };
    }
    return {};
  };

  const columns = [
    {
      title: 'Project',
      children: [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
        },
        {
          title: 'Name',
          dataIndex: 'pname',
          key: 'pname',
        },
      ]
    },
    {
      title: "Latest Sprint",
      children: [
        {
          title: 'ID',
          dataIndex: 'sprints',
          render: (value: CourseProjectsLatestInsights['sprints'], record: CourseProjectsLatestInsights) => {
            return value && value.length > 0 ? value[0].id : 'No sprints';
          },
          onCell: onCellExpandIfNoSprints,
        },
        {
          title: 'Name',
          dataIndex: 'sprints',
          render: (value: CourseProjectsLatestInsights['sprints'], record: CourseProjectsLatestInsights) => {
            return value && value.length > 0 ? value[0].name : '';
          },
          onCell: onCellCollapseIfNoSprints,
        },
        {
          title: 'Status',
          dataIndex: 'sprints',
          render: (value: CourseProjectsLatestInsights['sprints'], record: CourseProjectsLatestInsights) => {
            return value && value.length > 0 ? value[0].status : '';
          },
          onCell: onCellCollapseIfNoSprints,
        },
        {
          title: 'Start Date',
          dataIndex: 'sprints',
          render: (value: CourseProjectsLatestInsights['sprints'], record: CourseProjectsLatestInsights) => {
            return value && value.length > 0 ? formatDbDate(value[0].start_date) : '';
          },
          onCell: onCellCollapseIfNoSprints,
        },
        {
          title: 'End Date',
          dataIndex: 'sprints',
          render: (value: CourseProjectsLatestInsights['sprints'], record: CourseProjectsLatestInsights) => {
            return value && value.length > 0 ? formatDbDate(value[0].end_date) : '';
          },
          onCell: onCellCollapseIfNoSprints,
        },
        {
          title: 'Action',
          key: 'action',
          dataIndex: 'sprints',
          render: (value: CourseProjectsLatestInsights['sprints'], record: CourseProjectsLatestInsights) => (
            <Button
              onClick={() => {
                setSelectedProject(record);
                setIsInsightModalOpen(true);
              }}
            >
              View Insights
            </Button>
          ),
          onCell: onCellCollapseIfNoSprints,
        },
      ]
    }
  ];
  return (
    <Card>
      <Space direction="vertical" size="large">
        <Table
          dataSource={projectsLatestInsights}
          columns={columns}
          bordered
          title={() => <Typography.Title level={4}>Latest Insights🚀</Typography.Title>}
        />
      </Space>
      <Modal
        open={isInsightModalOpen}
        onCancel={() => setIsInsightModalOpen(false)}
        style={{
          height: '80vh',
          overflowY: 'auto',
          borderRadius: '10px',
        }}
        width={'80vw'}
        footer={[
          <Button key="close" onClick={() => setIsInsightModalOpen(false)}>
            Close
          </Button>
        ]}
        title={selectedProject &&
          <Typography.Title level={2}>
            {selectedProject?.pname}'s Insights
          </Typography.Title>
        }
      >
        {selectedProject && selectedProject.sprints && selectedProject.sprints.length > 0 ? (
          <Tabs
            items={selectedProject.sprints[0].sprintInsights.map((insight) => ({
              key: `${insight.id}`,
              label: insight.category,
              children: (
                <Space direction="vertical">
                  <Typography.Text disabled>Created at: {formatDbDate(insight.created_at)}</Typography.Text>
                  <Insight key={insight.id} insight={insight} />
                </Space>
              )
            }))}
          />
        ): (
          <Empty description="No insights available" />
        )}
      </Modal>
    </Card>
  );
}
