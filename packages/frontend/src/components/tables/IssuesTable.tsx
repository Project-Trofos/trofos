import { Button, Input, message, Select, Space, Table, Tag } from 'antd';
import { BacklogPriority, Issue, IssueStatus, IssueType } from '../../api/types';
import { useDeleteIssueMutation, useUpdateIssueMutation } from '../../api/issue';
import { getErrorMessage } from '../../helpers/error';
import { UserAvatar } from '../avatar/UserAvatar';
import { BACKLOG_PRIORITY_OPTIONS } from '../../helpers/constants';
import IssueModal from '../modals/IssueModal';
import { confirmDeleteIssue } from '../modals/confirm';
import { useParams } from 'react-router-dom';
import { useProject } from '../../api/hooks';

interface IssuesTableProps {
  issues?: Issue[];
  loading: boolean;
  assignedBy?: boolean;
}

const statusColors = {
  open: 'lightgray',
  valid: 'green',
  invalid: 'red',
  unable_to_replicate: 'blue',
};

export const transformToLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).replaceAll('_', ' ');

const IssuesTable: React.FC<IssuesTableProps> = ({ issues, loading, assignedBy = false }) => {
  const params = useParams();
  const { project } = useProject(Number(params.projectId || -1));
  const [updateIssue] = useUpdateIssueMutation();
  const [deleteIssue] = useDeleteIssueMutation();

  async function updateIssueField(issueId: number, fieldToUpdate: Partial<Issue>) {
    try {
      await updateIssue({ issueId, fieldToUpdate }).unwrap();
      message.success('Issue updated');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  }

  const handleDeleteIssue = async (issueId: number) => {
    try {
      await deleteIssue(issueId).unwrap();
      message.success('Issue deleted');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  return (
    <Table
      dataSource={issues}
      rowKey={(issue) => issue.id}
      bordered
      size="small"
      loading={loading}
      pagination={{ pageSize: 5 }}
    >
      <Table.Column
        width={100}
        title="ID"
        dataIndex="id"
        sorter={(a: Issue, b: Issue) => a.id - b.id}
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column
        width={400}
        title="Title"
        dataIndex="title"
        sorter={(a: Issue, b: Issue) => a.title.localeCompare(b.title)}
        sortDirections={['ascend', 'descend']}
        render={(title: string, record: Issue) =>
          assignedBy ? (
            <Input
              defaultValue={title}
              style={{
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                background: 'transparent',
                padding: 0,
                fontSize: 'inherit',
                width: '100%',
                borderBottom: '1px solid transparent',
              }}
              onBlur={(e) => {
                const newTitle = e.target.value.trim();
                if (newTitle && newTitle !== title) {
                  updateIssueField(record.id, { title: e.target.value });
                }
              }}
            />
          ) : (
            <>{title}</>
          )
        }
      />
      <Table.Column
        width={200}
        title="Status"
        dataIndex="status"
        sorter={(a: Issue, b: Issue) => {
          if (a.status == IssueStatus.OPEN) return -1;
          if (b.status == IssueStatus.OPEN) return 1;
          return a.status.localeCompare(b.status);
        }}
        sortDirections={['ascend', 'descend']}
        defaultSortOrder={'ascend'}
        render={(status: keyof typeof statusColors, record: Issue) =>
          assignedBy ? (
            <Tag color={statusColors[status]}>{transformToLabel(status)}</Tag>
          ) : (
            <Select
              value={status}
              onChange={(newStatus: keyof typeof statusColors) =>
                updateIssueField(record.id, { status: newStatus as IssueStatus })
              }
              options={Object.values(IssueStatus).map((status) => ({
                label: transformToLabel(status),
                value: status,
              }))}
              style={{ width: '100%' }}
            />
          )
        }
      />
      <Table.Column
        width={200}
        title="Type"
        dataIndex="type"
        sorter={(a: Issue, b: Issue) => a.type.localeCompare(b.type)}
        sortDirections={['ascend', 'descend']}
        render={(type: IssueType, record: Issue) =>
          assignedBy ? (
            <Select
              value={type}
              onChange={(newType: IssueType) => updateIssueField(record.id, { type: newType })}
              options={Object.values(IssueType).map((type) => ({
                label: transformToLabel(type),
                value: type,
              }))}
              style={{ width: '100%' }}
            />
          ) : (
            <>{transformToLabel(type)}</>
          )
        }
      />
      <Table.Column
        width={200}
        title="Priority"
        dataIndex="priority"
        sorter={(a: Issue, b: Issue) => {
          if (!a.priority) return 1; // If `a.priority` is null, move it down
          if (!b.priority) return -1; // If `b.priority` is null, move `a` up
          return a.priority.localeCompare(b.priority);
        }}
        sortDirections={['ascend', 'descend']}
        render={(priority: BacklogPriority, record: Issue) =>
          assignedBy ? (
            <Select
              value={priority || undefined}
              onChange={(newPriority: BacklogPriority) =>
                updateIssueField(record.id, { priority: newPriority ?? null })
              }
              options={BACKLOG_PRIORITY_OPTIONS.map(({ value, label }) => ({
                label,
                value,
              }))}
              style={{ width: '100%' }}
              allowClear
            />
          ) : priority ? (
            <>{transformToLabel(priority)}</>
          ) : (
            '-'
          )
        }
      />
      <Table.Column
        width={200}
        title="Reporter"
        dataIndex="reporter"
        render={({ user }, record: Issue) =>
          assignedBy ? (
            <Select
              value={record.reporter_id}
              onChange={(newReporter: number) => updateIssueField(record.id, { reporter_id: newReporter })}
              style={{ width: '100%' }}
            >
              {project?.users?.map(({ user }) => (
                <Select.Option key={user.user_id} value={user.user_id}>
                  <UserAvatar
                    className="user-select-avatar"
                    userDisplayName={user.user_display_name}
                    userHashString={user.user_email}
                  />
                  <span className="user-select-username-text">{user.user_display_name}</span>
                </Select.Option>
              ))}
            </Select>
          ) : (
            <>
              <UserAvatar
                className="user-select-avatar"
                userDisplayName={user.user_display_name}
                userHashString={user.user_email}
              />
              <span className="user-select-username-text">{user.user_display_name}</span>
            </>
          )
        }
      />
      <Table.Column
        width={200}
        title="Action"
        dataIndex="action"
        render={(_, record: Issue) => (
          <Space size="middle">
            <IssueModal defaultIssue={record} readOnly={!assignedBy} />
            {assignedBy && (
              <Button size="small" onClick={() => confirmDeleteIssue(() => handleDeleteIssue(record.id))}>
                Delete
              </Button>
            )}
          </Space>
        )}
      />
    </Table>
  );
};

export default IssuesTable;
