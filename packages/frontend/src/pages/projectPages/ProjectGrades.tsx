import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Input, InputNumber, Modal, Table, Tag } from 'antd';
import { useCourse, useProject } from '../../api/hooks';
import { useGetUserInfoQuery } from '../../api/auth';
import { useGetGradeHistoryQuery } from '../../api/grade';
import { useProjectGrades } from '../../api/hooks/gradeHooks';
import { FACULTY_ROLE_ID } from '../../api/role';
import { GradeAuditLogEntry, Milestone } from '../../api/types';
import Container from '../../components/layouts/Container';
import { Subheading } from '../../components/typography';

export default function ProjectGrades(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);

  const { project } = useProject(projectId);
  const { course, courseUserRoles } = useCourse(project?.course_id ? project.course_id.toString() : undefined);
  const { grades, isLoading, handleUpsertMilestoneGrade } = useProjectGrades(projectId);
  const { data: userInfo } = useGetUserInfoQuery();

  const isAdmin = userInfo?.userRoleActions.includes('admin') ?? false;
  // Editability is per-milestone (whoever is that milestone's assigned grader), but the
  // Action column itself is only shown at all if the user could edit at least one row.
  const canEditAnyGrade = isAdmin || (!!userInfo && (grades ?? []).some((g) => g.grader_id === userInfo.userId));

  // Viewing grade history mirrors the backend's canAssignTa check: any course FACULTY or
  // admin, not just a milestone's assigned TA (and never a student).
  const isFaculty =
    !!userInfo && (courseUserRoles ?? []).some((r) => r.user_id === userInfo.userId && r.role_id === FACULTY_ROLE_ID);
  const canViewHistory = isAdmin || isFaculty;
  // Students shouldn't see whether a grade is still a DRAFT vs PUBLISHED — they only ever
  // see published grades anyway (enforced server-side), so the column is just noise for them.
  const isStaff = isAdmin || isFaculty;

  const { data: history, isLoading: isHistoryLoading } = useGetGradeHistoryQuery(projectId, {
    skip: !canViewHistory,
  });

  const milestones: Milestone[] = course?.milestones ?? [];

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Local per-milestone drafts for score and comment — only sent to the backend when
  // that row's "Save" button is clicked, never while typing.
  const [scoreDrafts, setScoreDrafts] = useState<Record<number, number | undefined>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  useEffect(() => {
    const nextScoreDrafts: Record<number, number | undefined> = {};
    const nextCommentDrafts: Record<number, string> = {};
    milestones.forEach((milestone) => {
      const grade = grades?.find((g) => g.milestone_id === milestone.id);
      nextScoreDrafts[milestone.id] = grade?.score ?? undefined;
      nextCommentDrafts[milestone.id] = grade?.comment ?? '';
    });
    setScoreDrafts(nextScoreDrafts);
    setCommentDrafts(nextCommentDrafts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grades]);

  // Fields are read-only on page load; clicking "Edit" makes that row's Score/Comment
  // editable, and clicking "Save" (which replaces the Edit button) writes the change and
  // returns the row to read-only.
  const [editingMilestoneIds, setEditingMilestoneIds] = useState<Set<number>>(new Set());

  const handleEditGrade = (milestone: Milestone) => {
    const grade = grades?.find((g) => g.milestone_id === milestone.id);
    setScoreDrafts((prev) => ({ ...prev, [milestone.id]: grade?.score ?? undefined }));
    setCommentDrafts((prev) => ({ ...prev, [milestone.id]: grade?.comment ?? '' }));
    setEditingMilestoneIds((prev) => new Set(prev).add(milestone.id));
  };

  const getScoreError = (score: number | undefined, maxMarks: number): string | undefined => {
    if (score === undefined) {
      return 'Score is required';
    }
    if (score < 0 || score > maxMarks) {
      return `Score must be between 0 and ${maxMarks}`;
    }
    return undefined;
  };

  const handleSaveGrade = (milestone: Milestone) => {
    if (getScoreError(scoreDrafts[milestone.id], milestone.max_marks)) {
      return;
    }
    const grade = grades?.find((g) => g.milestone_id === milestone.id);
    const isDirty =
      scoreDrafts[milestone.id] !== (grade?.score ?? undefined) ||
      (commentDrafts[milestone.id] ?? '') !== (grade?.comment ?? '');
    if (isDirty) {
      handleUpsertMilestoneGrade(milestone.id, {
        score: scoreDrafts[milestone.id],
        comment: commentDrafts[milestone.id],
      });
    }
    setEditingMilestoneIds((prev) => {
      const next = new Set(prev);
      next.delete(milestone.id);
      return next;
    });
  };

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Subheading>Grading</Subheading>
        {canViewHistory && <Button onClick={() => setIsHistoryModalOpen(true)}>Grade History</Button>}
      </div>
      <Table dataSource={milestones} rowKey="id" loading={isLoading} bordered size="small" pagination={false}>
        <Table.Column title="Milestone" dataIndex="name" />
        <Table.Column
          title="Assigned TA"
          render={(_, milestone: Milestone) => {
            const grade = grades?.find((g) => g.milestone_id === milestone.id);
            const assignedTaName = course?.users.find((u) => u.user.user_id === grade?.grader_id)?.user
              .user_display_name;
            return <span>{assignedTaName ?? 'Unassigned'}</span>;
          }}
        />
        <Table.Column
          title="Score"
          render={(_, milestone: Milestone) => {
            const grade = grades?.find((g) => g.milestone_id === milestone.id);
            const canEditGrade = isAdmin || (!!userInfo && grade?.grader_id === userInfo.userId);
            if (!canEditGrade || !editingMilestoneIds.has(milestone.id)) {
              return (
                <span>
                  {grade?.score ?? '-'} / {milestone.max_marks}
                </span>
              );
            }
            const scoreError = getScoreError(scoreDrafts[milestone.id], milestone.max_marks);
            return (
              <div>
                <span>
                  <InputNumber
                    min={0}
                    // Deliberately no `max` here: antd's InputNumber rejects an out-of-range
                    // value at the keystroke level when `max` is set, so it never reaches
                    // onChange/our state at all — leaving nothing for us to validate or show
                    // an error for. We let the over-limit value commit, then validate it
                    // ourselves (see scoreError below) so Save can show an inline error and
                    // block, instead of the input just silently refusing the keystroke.
                    status={scoreError ? 'error' : undefined}
                    value={scoreDrafts[milestone.id]}
                    onKeyDown={(e) => {
                      // Named keys (Backspace, arrows, Tab, IME composition, ...) all report a
                      // multi-character `key`; only single-character keys are printable input,
                      // so this lets every non-printable key through without enumerating them.
                      if (e.ctrlKey || e.metaKey || e.key.length > 1) {
                        return;
                      }
                      // Only digits and a decimal point are allowed — no minus sign, letters,
                      // or scientific-notation characters ('e'/'+').
                      if (!/^[0-9.]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      if (!/^\d*\.?\d*$/.test(pasted)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(value) => setScoreDrafts((prev) => ({ ...prev, [milestone.id]: value ?? undefined }))}
                  />{' '}
                  / {milestone.max_marks}
                </span>
                {scoreError && <div style={{ color: 'red', fontSize: 12 }}>{scoreError}</div>}
              </div>
            );
          }}
        />
        <Table.Column
          title="Comment"
          width={320}
          render={(_, milestone: Milestone) => {
            const grade = grades?.find((g) => g.milestone_id === milestone.id);
            const canEditGrade = isAdmin || (!!userInfo && grade?.grader_id === userInfo.userId);
            if (!canEditGrade || !editingMilestoneIds.has(milestone.id)) {
              // Comments can run long (especially the feedback a student reads), so this
              // wraps onto multiple lines instead of being clipped to one.
              return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{grade?.comment}</div>;
            }
            return (
              <Input
                value={commentDrafts[milestone.id] ?? ''}
                onChange={(e) =>
                  setCommentDrafts((prev) => ({ ...prev, [milestone.id]: e.target.value }))
                }
              />
            );
          }}
        />
        {isStaff && (
          <Table.Column
            title="Status"
            render={(_, milestone: Milestone) => {
              const grade = grades?.find((g) => g.milestone_id === milestone.id);
              return <Tag color={grade?.status === 'PUBLISHED' ? 'green' : 'default'}>{grade?.status ?? 'DRAFT'}</Tag>;
            }}
          />
        )}
        {canEditAnyGrade && (
          <Table.Column
            title="Action"
            render={(_, milestone: Milestone) => {
              const grade = grades?.find((g) => g.milestone_id === milestone.id);
              const canEditGrade = isAdmin || (!!userInfo && grade?.grader_id === userInfo.userId);
              if (!canEditGrade) {
                return null;
              }
              if (!editingMilestoneIds.has(milestone.id)) {
                return (
                  <Button size="small" onClick={() => handleEditGrade(milestone)}>
                    Edit
                  </Button>
                );
              }
              const scoreError = getScoreError(scoreDrafts[milestone.id], milestone.max_marks);
              return (
                <Button size="small" disabled={!!scoreError} onClick={() => handleSaveGrade(milestone)}>
                  Save
                </Button>
              );
            }}
          />
        )}
      </Table>
      {canViewHistory && (
        <Modal
          title="Grade History"
          open={isHistoryModalOpen}
          onCancel={() => setIsHistoryModalOpen(false)}
          footer={null}
          width={800}
        >
          <Table dataSource={history} rowKey="id" loading={isHistoryLoading} bordered size="small" pagination={false}>
            <Table.Column
              title="Timestamp"
              dataIndex="created_at"
              render={(value: string) => new Date(value).toLocaleString()}
            />
            <Table.Column
              title="Actor"
              render={(_, entry: GradeAuditLogEntry) => entry.actor?.user_display_name ?? 'System'}
            />
            <Table.Column
              title="Milestone"
              render={(_, entry: GradeAuditLogEntry) =>
                milestones.find((m) => m.id === entry.milestone_id)?.name ?? '-'
              }
            />
            <Table.Column title="Action" dataIndex="action" />
            <Table.Column
              title="Resulting Value"
              render={(_, entry: GradeAuditLogEntry) => {
                if (entry.action === 'TA_ASSIGNED') {
                  return `Assigned TA: ${entry.assigned_ta_id ?? 'Unassigned'}`;
                }
                if (entry.action === 'MILESTONE_MAX_MARKS_UPDATED') {
                  const milestone = milestones.find((m) => m.id === entry.milestone_id);
                  return `Max Marks: ${milestone?.max_marks ?? '-'} (score/comment reset)`;
                }
                return `Score: ${entry.score ?? '-'}, Comment: ${entry.comment ?? '-'}`;
              }}
            />
          </Table>
        </Modal>
      )}
    </Container>
  );
}
