import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Input, InputNumber, Modal, Select, Space, Table, Tag, message } from 'antd';
import { useCourse } from '../../api/hooks';
import { useIsCourseManager } from '../../api/hooks/roleHooks';
import { useGetUserInfoQuery } from '../../api/auth';
import { useGetCourseGradingQuery, usePublishCourseGradingMutation, useUpdateGradingMutation } from '../../api/grading';
import { ADMIN_ROLE_ID, FACULTY_ROLE_ID } from '../../api/role';
import { ProjectGrade, ProjectGradeStatus } from '../../api/types';
import Container from '../../components/layouts/Container';
import { Subheading } from '../../components/typography';
import { confirmPublishGrades } from '../../components/modals/confirm';
import { getErrorMessage } from '../../helpers/error';
import useDebouncedCallback from '../../helpers/useDebouncedCallback';

const STATUS_COLORS: Record<ProjectGradeStatus, string> = {
  draft: 'default',
  submitted: 'blue',
  published: 'green',
};

export default function CourseGrading(): JSX.Element {
  const params = useParams();
  const courseId = Number(params.courseId);

  const { course, courseUserRoles } = useCourse(params.courseId);
  const { data: userInfo } = useGetUserInfoQuery();
  const { isCourseManager } = useIsCourseManager(courseId);

  const { data: grades, isLoading } = useGetCourseGradingQuery(courseId);
  const [updateGrading] = useUpdateGradingMutation();
  const [publishCourseGrading, { isLoading: isPublishing }] = usePublishCourseGradingMutation();

  const [commentModalGrade, setCommentModalGrade] = useState<ProjectGrade | null>(null);
  const [commentDraft, setCommentDraft] = useState('');

  const taOptions = useMemo(() => {
    if (!course || !courseUserRoles) {
      return [];
    }
    const graderUserIds = new Set(
      courseUserRoles
        .filter((role) => role.role_id === FACULTY_ROLE_ID || role.role_id === ADMIN_ROLE_ID)
        .map((role) => role.user_id),
    );
    return course.users
      .filter((u) => graderUserIds.has(u.user.user_id))
      .map((u) => ({ value: u.user.user_id, label: u.user.user_display_name || u.user.user_email }));
  }, [course, courseUserRoles]);

  const canEditRow = (row: ProjectGrade) =>
    row.status !== 'published' && (isCourseManager || row.assigned_ta_id === userInfo?.userId);

  const debouncedUpdateMarks = useDebouncedCallback((projectId: number, marks: number | null) => {
    if (marks === null) {
      return;
    }
    updateGrading({ courseId, projectId, marks }).unwrap().catch((e) => message.error(getErrorMessage(e)));
  }, 300);

  const handleAssignedTaChange = (record: ProjectGrade, assignedTaId: number | undefined) => {
    updateGrading({ courseId, projectId: record.project_id, assignedTaId: assignedTaId ?? null })
      .unwrap()
      .catch((e) => message.error(getErrorMessage(e)));
  };

  const handleToggleSubmitted = (record: ProjectGrade) => {
    const status: ProjectGradeStatus = record.status === 'draft' ? 'submitted' : 'draft';
    updateGrading({ courseId, projectId: record.project_id, status })
      .unwrap()
      .catch((e) => message.error(getErrorMessage(e)));
  };

  const handlePublishAll = () => {
    confirmPublishGrades(async () => {
      await publishCourseGrading({ courseId }).unwrap();
      message.success('Grades published!');
    });
  };

  const handleOpenComments = (record: ProjectGrade) => {
    setCommentModalGrade(record);
    setCommentDraft(record.comments ?? '');
  };

  const handleSaveComment = async () => {
    if (!commentModalGrade) {
      return;
    }
    try {
      await updateGrading({
        courseId,
        projectId: commentModalGrade.project_id,
        comments: commentDraft,
      }).unwrap();
      setCommentModalGrade(null);
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  return (
    <Container>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Subheading>Grading Matrix</Subheading>
        {isCourseManager && (
          <Button type="primary" loading={isPublishing} onClick={handlePublishAll}>
            Publish All Marks
          </Button>
        )}
      </Space>
      <Table dataSource={grades} rowKey="id" loading={isLoading} bordered size="small" pagination={{ pageSize: 10 }}>
        <Table.Column title="Project Name" dataIndex={['project', 'pname']} />
        <Table.Column
          title="Assigned TA"
          render={(_, record: ProjectGrade) => (
            <Select
              style={{ width: 200 }}
              allowClear
              placeholder="Unassigned"
              options={taOptions}
              value={record.assigned_ta_id ?? undefined}
              disabled={!isCourseManager || record.status === 'published'}
              onChange={(value) => handleAssignedTaChange(record, value)}
            />
          )}
        />
        <Table.Column
          title="Marks"
          render={(_, record: ProjectGrade) => (
            <InputNumber
              min={0}
              max={100}
              defaultValue={record.marks !== null ? Number(record.marks) : undefined}
              disabled={!canEditRow(record)}
              onChange={(value) => debouncedUpdateMarks(record.project_id, value)}
            />
          )}
        />
        <Table.Column
          title="Comments"
          render={(_, record: ProjectGrade) => (
            <Button disabled={!canEditRow(record)} onClick={() => handleOpenComments(record)}>
              {record.comments ? 'View / Edit' : 'Add Comment'}
            </Button>
          )}
        />
        <Table.Column
          title="Status"
          render={(_, record: ProjectGrade) => (
            <Space>
              <Tag color={STATUS_COLORS[record.status]}>{record.status}</Tag>
              {canEditRow(record) && (
                <Button size="small" onClick={() => handleToggleSubmitted(record)}>
                  {record.status === 'draft' ? 'Submit' : 'Revert to Draft'}
                </Button>
              )}
            </Space>
          )}
        />
      </Table>
      <Modal
        title={`Comments${commentModalGrade ? `: ${commentModalGrade.project.pname}` : ''}`}
        open={!!commentModalGrade}
        onOk={handleSaveComment}
        onCancel={() => setCommentModalGrade(null)}
      >
        <Input.TextArea
          rows={6}
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          disabled={commentModalGrade ? !canEditRow(commentModalGrade) : false}
        />
      </Modal>
    </Container>
  );
}
