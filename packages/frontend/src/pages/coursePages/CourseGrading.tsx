import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, Checkbox, InputNumber, Select, Space, Table, Tag, Tooltip } from 'antd';
import { useCourse } from '../../api/hooks';
import { useIsCourseManager } from '../../api/hooks/roleHooks';
import { useCourseGrades } from '../../api/hooks/gradeHooks';
import { ADMIN_ROLE_ID, FACULTY_ROLE_ID } from '../../api/role';
import { Grade, GradeStatus, Milestone, Project } from '../../api/types';
import Container from '../../components/layouts/Container';
import { Subheading } from '../../components/typography';
import { confirmPublishGrades, confirmUnpublishGrades } from '../../components/modals/confirm';
import { downloadCsv } from '../../helpers/csvExport';

const STATUS_COLORS: Record<GradeStatus, string> = {
  DRAFT: 'default',
  PUBLISHED: 'green',
};

export default function CourseGrading(): JSX.Element {
  const params = useParams();
  const courseId = Number(params.courseId);

  const { course, filteredProjects, courseUserRoles, handleUpdateMilestone } = useCourse(params.courseId);
  const { isCourseManager } = useIsCourseManager(courseId);

  const { grades, isLoading, handlePublishGrade, handleUnpublishGrade, handleAssignTa } = useCourseGrades(courseId);

  const [searchParams] = useSearchParams();
  const milestoneIdParam = searchParams.get('milestoneId');
  // Pre-select the milestone named in the URL (e.g. when arriving from the
  // "View Grades" link on the delete-milestone confirmation), instead of
  // defaulting to the latest milestone.
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | undefined>(
    milestoneIdParam ? Number(milestoneIdParam) : undefined,
  );

  const milestones: Milestone[] = course?.milestones ?? [];

  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()),
    [milestones],
  );

  // Default to the latest (last-starting) milestone once milestones have loaded.
  const effectiveMilestoneId = selectedMilestoneId ?? sortedMilestones[sortedMilestones.length - 1]?.id;
  const selectedMilestone = milestones.find((m) => m.id === effectiveMilestoneId);

  // Local draft for the Total Marks field — only sent to the backend when "Save" is clicked,
  // never on every keystroke/blur. Resynced whenever the selected milestone changes.
  const [maxMarksDraft, setMaxMarksDraft] = useState<number | undefined>(selectedMilestone?.max_marks);
  useEffect(() => {
    setMaxMarksDraft(selectedMilestone?.max_marks);
  }, [selectedMilestone?.id, selectedMilestone?.max_marks]);

  // Changing total marks resets every grade's score/comment for this milestone (see below), so
  // once any grade has been published it's locked — unpublish first.
  const hasPublishedGradeForMilestone = selectedMilestone
    ? (grades ?? []).some((g) => g.milestone_id === selectedMilestone.id && g.status === 'PUBLISHED')
    : false;

  const gradesByProject = useMemo(() => {
    const map = new Map<number, Map<number, Grade>>();
    (grades ?? []).forEach((g) => {
      if (!map.has(g.project_id)) {
        map.set(g.project_id, new Map());
      }
      map.get(g.project_id)?.set(g.milestone_id, g);
    });
    return map;
  }, [grades]);

  // TA assignment is tracked per (project, milestone) via Grade.grader_id, so it's always
  // scoped to the currently selected milestone.
  const assignedTaIdForProject = (projectId: number): number | null | undefined =>
    selectedMilestone ? gradesByProject.get(projectId)?.get(selectedMilestone.id)?.grader_id : undefined;

  // Workload = how many projects (for the selected milestone) are currently assigned to each
  // TA, so a manager can balance assignments instead of guessing.
  const workloadByTaId = useMemo(() => {
    const map = new Map<number, number>();
    if (!selectedMilestone) {
      return map;
    }
    filteredProjects.forEach((p) => {
      const taId = assignedTaIdForProject(p.id);
      if (taId === null || taId === undefined) {
        return;
      }
      map.set(taId, (map.get(taId) ?? 0) + 1);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProjects, gradesByProject, selectedMilestone]);

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
      .map((u) => {
        const name = u.user.user_display_name || u.user.user_email;
        const workload = workloadByTaId.get(u.user.user_id) ?? 0;
        return {
          value: u.user.user_id,
          name,
          label: `${name} (${workload} project${workload === 1 ? '' : 's'})`,
        };
      });
  }, [course, courseUserRoles, workloadByTaId]);

  const unassignedCount = useMemo(
    () => filteredProjects.filter((p) => !assignedTaIdForProject(p.id)).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredProjects, gradesByProject, selectedMilestone],
  );

  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const visibleProjects = useMemo(
    () => (showUnassignedOnly ? filteredProjects.filter((p) => !assignedTaIdForProject(p.id)) : filteredProjects),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredProjects, showUnassignedOnly, gradesByProject, selectedMilestone],
  );

  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [bulkAssignTaId, setBulkAssignTaId] = useState<number | undefined>(undefined);

  const handleBulkAssignTa = () => {
    if (bulkAssignTaId === undefined || selectedProjectIds.length === 0 || !selectedMilestone) {
      return;
    }
    selectedProjectIds.forEach((projectId) => handleAssignTa(projectId, selectedMilestone.id, bulkAssignTaId));
    setSelectedProjectIds([]);
    setBulkAssignTaId(undefined);
  };

  const handleSaveMaxMarks = () => {
    if (
      !selectedMilestone ||
      maxMarksDraft === undefined ||
      maxMarksDraft === selectedMilestone.max_marks ||
      hasPublishedGradeForMilestone
    ) {
      return;
    }
    handleUpdateMilestone(selectedMilestone.id, { milestoneMaxMarks: maxMarksDraft });
  };

  // Publish/unpublish only operate on the checked rows, scoped to the selected milestone.
  const selectedGrades = useMemo(() => {
    if (!selectedMilestone) {
      return [];
    }
    return selectedProjectIds
      .map((projectId) => gradesByProject.get(projectId)?.get(selectedMilestone.id))
      .filter((grade): grade is Grade => !!grade);
  }, [selectedProjectIds, gradesByProject, selectedMilestone]);

  const handlePublishSelected = () => {
    if (selectedGrades.length === 0) {
      return;
    }
    confirmPublishGrades(async () => {
      await Promise.all(selectedGrades.map((grade) => handlePublishGrade(grade.project_id, grade.id)));
    });
  };

  const handleUnpublishSelected = () => {
    if (selectedGrades.length === 0) {
      return;
    }
    confirmUnpublishGrades(async () => {
      await Promise.all(selectedGrades.map((grade) => handleUnpublishGrade(grade.project_id, grade.id)));
    });
  };

  const handleExportCsv = () => {
    const header = [
      'Project Name',
      ...milestones.flatMap((m) => [`${m.name} Score`, `${m.name} Status`, `${m.name} Assigned TA`]),
    ];

    const rows = filteredProjects.map((project) => {
      const projectGrades = gradesByProject.get(project.id);

      return [
        project.pname,
        ...milestones.flatMap((m) => {
          const g = projectGrades?.get(m.id);
          const taLabel = taOptions.find((o) => o.value === g?.grader_id)?.name ?? '';
          return [
            g?.score !== undefined && g?.score !== null ? `${g.score}/${m.max_marks}` : '',
            g?.status ?? 'DRAFT',
            taLabel,
          ];
        }),
      ];
    });

    downloadCsv(`course-${courseId}-grades.csv`, [header, ...rows]);
  };

  return (
    <Container>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Subheading>Grading Matrix</Subheading>
        <Button onClick={handleExportCsv}>Export to CSV</Button>
      </Space>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <span>Select Milestone</span>
          <Select
            style={{ width: 240 }}
            value={effectiveMilestoneId}
            onChange={(value) => setSelectedMilestoneId(Number(value))}
            placeholder="Select Milestone"
          >
            {sortedMilestones.map((m) => (
              <Select.Option key={m.id} value={m.id}>
                {m.name}
              </Select.Option>
            ))}
          </Select>
          <Tooltip
            title={
              hasPublishedGradeForMilestone
                ? 'Total marks cannot be changed while any grade for this milestone is published. Unpublish them first.'
                : undefined
            }
          >
            <span>
              <InputNumber
                addonBefore="Total Marks"
                min={0}
                disabled={!isCourseManager || !selectedMilestone || hasPublishedGradeForMilestone}
                value={maxMarksDraft}
                onChange={(value) => setMaxMarksDraft(value ?? undefined)}
              />
            </span>
          </Tooltip>
        </Space>
        <Tooltip
          title={
            hasPublishedGradeForMilestone
              ? 'Total marks cannot be changed while any grade for this milestone is published. Unpublish them first.'
              : undefined
          }
        >
          <span>
            <Button
              disabled={
                !isCourseManager ||
                !selectedMilestone ||
                maxMarksDraft === selectedMilestone?.max_marks ||
                hasPublishedGradeForMilestone
              }
              onClick={handleSaveMaxMarks}
            >
              Save Total Marks
            </Button>
          </span>
        </Tooltip>
      </div>
      {isCourseManager && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <span>{unassignedCount} of {filteredProjects.length} projects unassigned</span>
            <Checkbox checked={showUnassignedOnly} onChange={(e) => setShowUnassignedOnly(e.target.checked)}>
              Show unassigned only
            </Checkbox>
          </Space>
          <Space>
            <span>Assign selected to</span>
            <Select
              style={{ width: 200 }}
              showSearch
              optionFilterProp="label"
              placeholder="Select TA"
              value={bulkAssignTaId}
              disabled={selectedProjectIds.length === 0 || !selectedMilestone}
              onChange={(value) => setBulkAssignTaId(Number(value))}
            >
              {taOptions.map((option) => (
                <Select.Option key={option.value} value={option.value} label={option.label}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            <Button
              disabled={selectedProjectIds.length === 0 || bulkAssignTaId === undefined || !selectedMilestone}
              onClick={handleBulkAssignTa}
            >
              Assign
            </Button>
            <Button disabled={selectedGrades.length === 0} onClick={handleUnpublishSelected}>
              Unpublish
            </Button>
            <Button type="primary" disabled={selectedGrades.length === 0} onClick={handlePublishSelected}>
              Publish
            </Button>
          </Space>
        </div>
      )}
      <Table
        dataSource={visibleProjects}
        rowKey="id"
        loading={isLoading}
        bordered
        size="small"
        pagination={{ pageSize: 10 }}
        rowSelection={
          isCourseManager
            ? {
                selectedRowKeys: selectedProjectIds,
                onChange: (keys) => setSelectedProjectIds(keys.map(Number)),
              }
            : undefined
        }
      >
        <Table.Column
          title="Project Name"
          render={(_, project: Project) => (
            <Tooltip title="Click to view this project's Grading page">
              <Link to={`/project/${project.id}/grades`}>{project.pname}</Link>
            </Tooltip>
          )}
        />
        <Table.Column
          title={selectedMilestone ? `Assigned TA (${selectedMilestone.name})` : 'Assigned TA'}
          render={(_, project: Project) => {
            if (!selectedMilestone) {
              return <span>Select a milestone</span>;
            }
            const assignedTa = taOptions.find((option) => option.value === assignedTaIdForProject(project.id));
            return <span>{assignedTa?.name ?? 'Unassigned'}</span>;
          }}
        />
        {selectedMilestone && (
          <Table.Column
            key={selectedMilestone.id}
            title={`${selectedMilestone.name} (/${selectedMilestone.max_marks})`}
            render={(_, project: Project) => {
              const grade = gradesByProject.get(project.id)?.get(selectedMilestone.id);
              return (
                <Space>
                  <span>
                    {grade?.score ?? '-'} / {selectedMilestone.max_marks}
                  </span>
                  <span>{grade?.comment}</span>
                </Space>
              );
            }}
          />
        )}
        {selectedMilestone && (
          <Table.Column
            title="Status"
            render={(_, project: Project) => {
              const grade = gradesByProject.get(project.id)?.get(selectedMilestone.id);
              return <Tag color={STATUS_COLORS[grade?.status ?? 'DRAFT']}>{grade?.status ?? 'DRAFT'}</Tag>;
            }}
          />
        )}
      </Table>
    </Container>
  );
}
