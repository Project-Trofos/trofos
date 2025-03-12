import { Badge, Button, Card, Empty, Flex, Modal, Space, Table, Tabs, Tag, Typography } from "antd";
import { CourseProjectsLatestInsights, SprintInsight } from "../../api/types";
import { formatDbDate } from "../../helpers/dateFormatter";
import { useState } from "react";
import { Insight } from "../modals/SprintInsightModal";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../app/hooks";
import { markSprintAsSeen } from "../../app/localSettingsSlice";

const renderSprintStatusTag = (status: string) => {
  switch (status) {
    case 'completed':
      return <Tag bordered={false} color="geekblue">Completed</Tag>;
    case 'closed':
      return <Tag bordered={false} color="gold">Closed</Tag>;
    default:
      return <Tag bordered={false} color="red">{status}</Tag>;
  }
};

export default function CourseRetrospectiveInsightHubCard({
  projectsLatestInsights,
  projectIdsWithUnseenLatestSprintInsights,
}: {
  projectsLatestInsights: CourseProjectsLatestInsights[],
  projectIdsWithUnseenLatestSprintInsights: number[],
}): JSX.Element {
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CourseProjectsLatestInsights | null>(null);
  const dispatch = useAppDispatch();

  const onCellExpandIfNoSprints = (record: CourseProjectsLatestInsights, index: number) => {
    if (!record.sprints || record.sprints.length === 0) {
      return {
        colSpan: 6,
        align: 'center',
      };
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
          fixed: 'left',
        },
        {
          title: 'Name',
          dataIndex: 'pname',
          key: 'pname',
          fixed: 'left',
          render: (value: string, record: CourseProjectsLatestInsights) => (
            <Typography.Link href={`/project/${record.id}`} target="_blank">
              {value}
            </Typography.Link>
          )
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
            return value && value.length > 0 ? value[0].id : (
              <Tag
                color="red"
                icon={<ExclamationCircleOutlined />}
              >
                No Completed Sprints
              </Tag>
            );
          },
          onCell: onCellExpandIfNoSprints,
        },
        {
          title: 'Name',
          dataIndex: 'sprints',
          render: (value: CourseProjectsLatestInsights['sprints'], record: CourseProjectsLatestInsights) => {
            return value && value.length > 0 ? (
              <Typography.Link href={`/project/${record.id}/board/${value[0].id}`} target="_blank">
                {value[0].name}
              </Typography.Link>
            ) : '';
          },
          onCell: onCellCollapseIfNoSprints,
        },
        {
          title: 'Status',
          dataIndex: 'sprints',
          render: (value: CourseProjectsLatestInsights['sprints'], record: CourseProjectsLatestInsights) => {
            return value && value.length > 0 ? renderSprintStatusTag(value[0].status) : '';
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
            projectIdsWithUnseenLatestSprintInsights.includes(record.id) ? (
              <Badge dot>
                <Button
                  onClick={() => {
                    setSelectedProject(record);
                    setIsInsightModalOpen(true);
                    dispatch(markSprintAsSeen(record.sprints[0].id.toString()));
                  }}
                >
                  View Insights
                </Button>
              </Badge>
            ) : (
              <Button
                onClick={() => {
                  setSelectedProject(record);
                  setIsInsightModalOpen(true);
                }}
              >
                View Insights
              </Button>
            )
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
          tableLayout='auto'
          style={{ borderWidth: '2px' }}
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
