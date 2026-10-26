import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, Checkbox, InputNumber, Select, Space, Table, Tabs, Tag, Tooltip } from 'antd';
import { useCourse } from '../../api/hooks';
import { useIsCourseManager } from '../../api/hooks/roleHooks';
import { useCourseGrades } from '../../api/hooks/gradeHooks';
import { useGetSprintsByCourseIdQuery, Sprint } from '../../api/sprint';
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

  const {
    grades,
    isLoading,
    handlePublishGrade,
    handleUnpublishGrade,
    handleAssignTa,
    handleAssignTaForSprint,
    handleBulkSetSprintMaxMarks,
  } = useCourseGrades(courseId);
  const { data: sprintsData, isLoading: isSprintsLoading } = useGetSprintsByCourseIdQuery(courseId);
  const sprints: Sprint[] = sprintsData ?? [];

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
      if (g.milestone_id === null) {
        return;
      }
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

  // Publish is only allowed when every selected row has a grade and that grade has been
  // scored; unpublish is only allowed when every selected row's grade is already published.
  const canPublishSelected =
    selectedProjectIds.length > 0 &&
    selectedGrades.length === selectedProjectIds.length &&
    selectedGrades.every((grade) => grade.score !== null && grade.score !== undefined);

  const canUnpublishSelected =
    selectedProjectIds.length > 0 &&
    selectedGrades.length === selectedProjectIds.length &&
    selectedGrades.every((grade) => grade.status === 'PUBLISHED');

  const handlePublishSelected = () => {
    if (!canPublishSelected) {
      return;
    }
    confirmPublishGrades(async () => {
      await Promise.all(selectedGrades.map((grade) => handlePublishGrade(grade.project_id, grade.id)));
    });
  };

  const handleUnpublishSelected = () => {
    if (!canUnpublishSelected) {
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

  // Every (project, sprint) pair in the course, flattened — unlike milestones, sprints aren't
  // a shared course-wide, so there's no single "selected sprint" to pivot a table on.
  const gradesBySprintId = useMemo(() => {
    const map = new Map<number, Grade>();
    (grades ?? []).forEach((g) => {
      if (g.sprint_id !== null) {
        map.set(g.sprint_id, g);
      }
    });
    return map;
  }, [grades]);

  const projectNameById = useMemo(
    () => new Map(filteredProjects.map((p) => [p.id, p.pname])),
    [filteredProjects],
  );

  const workloadBySprintTaId = useMemo(() => {
    const map = new Map<number, number>();
    sprints.forEach((sprint) => {
      const taId = gradesBySprintId.get(sprint.id)?.grader_id;
      if (taId === null || taId === undefined) {
        return;
      }
      map.set(taId, (map.get(taId) ?? 0) + 1);
    });
    return map;
  }, [sprints, gradesBySprintId]);

  const sprintTaOptions = useMemo(() => {
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
        const workload = workloadBySprintTaId.get(u.user.user_id) ?? 0;
        return {
          value: u.user.user_id,
          name,
          label: `${name} (${workload} sprint${workload === 1 ? '' : 's'})`,
        };
      });
  }, [course, courseUserRoles, workloadBySprintTaId]);

  // Sprint names are per-project, 
  // Assuming teams commonly share a naming scheme ("Sprint 1", "Sprint 2"),
  // filtering by name gives a course-wide view of the same sprint across projects.
  const uniqueSprintNames = useMemo(
    () =>
      Array.from(new Set(sprints.map((s) => s.name))).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
      ),
    [sprints],
  );
  const [selectedSprintName, setSelectedSprintName] = useState<string | undefined>(undefined);
  const sprintsMatchingName = useMemo(
    () => (selectedSprintName === undefined ? sprints : sprints.filter((s) => s.name === selectedSprintName)),
    [sprints, selectedSprintName],
  );

  const unassignedSprintCount = useMemo(
    () => sprintsMatchingName.filter((s) => !gradesBySprintId.get(s.id)?.grader_id).length,
    [sprintsMatchingName, gradesBySprintId],
  );

  const [showUnassignedSprintsOnly, setShowUnassignedSprintsOnly] = useState(false);
  const visibleSprints = useMemo(
    () =>
      showUnassignedSprintsOnly
        ? sprintsMatchingName.filter((s) => !gradesBySprintId.get(s.id)?.grader_id)
        : sprintsMatchingName,
    [sprintsMatchingName, showUnassignedSprintsOnly, gradesBySprintId],
  );

  const [selectedSprintIds, setSelectedSprintIds] = useState<number[]>([]);

  // Clear row selection when the name filter changes so bulk actions never hit rows that are no
  // longer visible.
  const handleSprintNameFilterChange = (value: string | undefined) => {
    setSelectedSprintName(value);
    setSelectedSprintIds([]);
  };
  const [bulkSprintMaxMarksDraft, setBulkSprintMaxMarksDraft] = useState<number | undefined>(undefined);
  const [bulkSprintAssignTaId, setBulkSprintAssignTaId] = useState<number | undefined>(undefined);

  const hasPublishedGradeForSelectedSprints = selectedSprintIds.some(
    (id) => gradesBySprintId.get(id)?.status === 'PUBLISHED',
  );

  const handleBulkSaveSprintMaxMarks = () => {
    if (bulkSprintMaxMarksDraft === undefined || selectedSprintIds.length === 0 || hasPublishedGradeForSelectedSprints) {
      return;
    }
    handleBulkSetSprintMaxMarks(selectedSprintIds, bulkSprintMaxMarksDraft);
  };

  const handleBulkAssignTaForSprints = () => {
    if (bulkSprintAssignTaId === undefined || selectedSprintIds.length === 0) {
      return;
    }
    selectedSprintIds.forEach((sprintId) => {
      const sprint = sprints.find((s) => s.id === sprintId);
      if (sprint) {
        handleAssignTaForSprint(sprint.project_id, sprint.id, bulkSprintAssignTaId);
      }
    });
    setSelectedSprintIds([]);
    setBulkSprintAssignTaId(undefined);
  };

  const selectedSprintGrades = useMemo(
    () => selectedSprintIds.map((id) => gradesBySprintId.get(id)).filter((grade): grade is Grade => !!grade),
    [selectedSprintIds, gradesBySprintId],
  );

  // Publish is only allowed when every selected sprint has a grade and that grade has been
  // scored; unpublish is only allowed when every selected sprint's grade is already published.
  const canPublishSelectedSprints =
    selectedSprintIds.length > 0 &&
    selectedSprintGrades.length === selectedSprintIds.length &&
    selectedSprintGrades.every((grade) => grade.score !== null && grade.score !== undefined);

  const canUnpublishSelectedSprints =
    selectedSprintIds.length > 0 &&
    selectedSprintGrades.length === selectedSprintIds.length &&
    selectedSprintGrades.every((grade) => grade.status === 'PUBLISHED');

  const handlePublishSelectedSprints = () => {
    if (!canPublishSelectedSprints) {
      return;
    }
    confirmPublishGrades(async () => {
      await Promise.all(selectedSprintGrades.map((grade) => handlePublishGrade(grade.project_id, grade.id)));
    });
  };

  const handleUnpublishSelectedSprints = () => {
    if (!canUnpublishSelectedSprints) {
      return;
    }
    confirmUnpublishGrades(async () => {
      await Promise.all(selectedSprintGrades.map((grade) => handleUnpublishGrade(grade.project_id, grade.id)));
    });
  };

  const handleExportSprintCsv = () => {
    const header = ['Project Name', 'Sprint', 'Score', 'Status', 'Assigned TA'];

    const rows = sprints.map((sprint) => {
      const grade = gradesBySprintId.get(sprint.id);
      const taLabel = sprintTaOptions.find((o) => o.value === grade?.grader_id)?.name ?? '';
      return [
        projectNameById.get(sprint.project_id) ?? '',
        sprint.name,
        grade?.score !== undefined && grade?.score !== null && sprint.max_marks !== null
          ? `${grade.score}/${sprint.max_marks}`
          : '',
        grade?.status ?? 'DRAFT',
        taLabel,
      ];
    });

    downloadCsv(`course-${courseId}-sprint-grades.csv`, [header, ...rows]);
  };

  const milestonesTabContent = (
    <>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span />
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
            <Tooltip
              title={
                selectedProjectIds.length > 0 && !canUnpublishSelected
                  ? 'All selected row(s) must have a published grade to unpublish.'
                  : undefined
              }
            >
              <span>
                <Button disabled={!canUnpublishSelected} onClick={handleUnpublishSelected}>
                  Unpublish
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                selectedProjectIds.length > 0 && !canPublishSelected
                  ? 'All selected row(s) must have a grade with marks populated to publish.'
                  : undefined
              }
            >
              <span>
                <Button type="primary" disabled={!canPublishSelected} onClick={handlePublishSelected}>
                  Publish
                </Button>
              </span>
            </Tooltip>
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
    </>
  );

  const sprintsTabContent = (
    <>
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span />
        <Button onClick={handleExportSprintCsv}>Export to CSV</Button>
      </Space>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <span>Filter Sprint</span>
          <Select
            style={{ width: 240 }}
            allowClear
            showSearch
            value={selectedSprintName}
            onChange={(value) => handleSprintNameFilterChange(value ?? undefined)}
            placeholder="All Sprints"
          >
            {uniqueSprintNames.map((name) => (
              <Select.Option key={name} value={name}>
                {name}
              </Select.Option>
            ))}
          </Select>
          <Tooltip
            title={
              hasPublishedGradeForSelectedSprints
                ? 'Total marks cannot be changed while any selected sprint has a published grade. Unpublish them first.'
                : undefined
            }
          >
            <span>
              <InputNumber
                addonBefore="Total Marks"
                min={0}
                disabled={!isCourseManager || selectedSprintIds.length === 0 || hasPublishedGradeForSelectedSprints}
                value={bulkSprintMaxMarksDraft}
                onChange={(value) => setBulkSprintMaxMarksDraft(value ?? undefined)}
              />
            </span>
          </Tooltip>
        </Space>
        <Tooltip
          title={
            hasPublishedGradeForSelectedSprints
              ? 'Total marks cannot be changed while any selected sprint has a published grade. Unpublish them first.'
              : undefined
          }
        >
          <span>
            <Button
              disabled={
                !isCourseManager ||
                selectedSprintIds.length === 0 ||
                bulkSprintMaxMarksDraft === undefined ||
                hasPublishedGradeForSelectedSprints
              }
              onClick={handleBulkSaveSprintMaxMarks}
            >
              Apply to Selected
            </Button>
          </span>
        </Tooltip>
      </div>
      {isCourseManager && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <span>{unassignedSprintCount} of {sprintsMatchingName.length} sprints unassigned</span>
            <Checkbox checked={showUnassignedSprintsOnly} onChange={(e) => setShowUnassignedSprintsOnly(e.target.checked)}>
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
              value={bulkSprintAssignTaId}
              disabled={selectedSprintIds.length === 0}
              onChange={(value) => setBulkSprintAssignTaId(Number(value))}
            >
              {sprintTaOptions.map((option) => (
                <Select.Option key={option.value} value={option.value} label={option.label}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            <Button
              disabled={selectedSprintIds.length === 0 || bulkSprintAssignTaId === undefined}
              onClick={handleBulkAssignTaForSprints}
            >
              Assign
            </Button>
            <Tooltip
              title={
                selectedSprintIds.length > 0 && !canUnpublishSelectedSprints
                  ? 'All selected row(s) must have a published grade to unpublish.'
                  : undefined
              }
            >
              <span>
                <Button disabled={!canUnpublishSelectedSprints} onClick={handleUnpublishSelectedSprints}>
                  Unpublish
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                selectedSprintIds.length > 0 && !canPublishSelectedSprints
                  ? 'All selected row(s) must have a grade with marks populated to publish.'
                  : undefined
              }
            >
              <span>
                <Button
                  type="primary"
                  disabled={!canPublishSelectedSprints}
                  onClick={handlePublishSelectedSprints}
                >
                  Publish
                </Button>
              </span>
            </Tooltip>
          </Space>
        </div>
      )}
      <Table
        dataSource={visibleSprints}
        rowKey="id"
        loading={isSprintsLoading}
        bordered
        size="small"
        pagination={{ pageSize: 10 }}
        rowSelection={
          isCourseManager
            ? {
                selectedRowKeys: selectedSprintIds,
                onChange: (keys) => setSelectedSprintIds(keys.map(Number)),
              }
            : undefined
        }
      >
        <Table.Column
          title="Project Name"
          render={(_, sprint: Sprint) => (
            <Tooltip title="Click to view this project's Grading page">
              <Link to={`/project/${sprint.project_id}/grades?tab=sprints`}>{projectNameById.get(sprint.project_id) ?? ''}</Link>
            </Tooltip>
          )}
        />
        <Table.Column title="Sprint" dataIndex="name" />
        <Table.Column
          title="Total Marks"
          render={(_, sprint: Sprint) => <span>{sprint.max_marks ?? 'Not gradable yet'}</span>}
        />
        <Table.Column
          title="Assigned TA"
          render={(_, sprint: Sprint) => {
            const grade = gradesBySprintId.get(sprint.id);
            const assignedTa = sprintTaOptions.find((option) => option.value === grade?.grader_id);
            return <span>{assignedTa?.name ?? 'Unassigned'}</span>;
          }}
        />
        <Table.Column
          title="Score"
          render={(_, sprint: Sprint) => {
            const grade = gradesBySprintId.get(sprint.id);
            return (
              <Space>
                <span>
                  {grade?.score ?? '-'} / {sprint.max_marks ?? '-'}
                </span>
                <span>{grade?.comment}</span>
              </Space>
            );
          }}
        />
        <Table.Column
          title="Status"
          render={(_, sprint: Sprint) => {
            const grade = gradesBySprintId.get(sprint.id);
            return <Tag color={STATUS_COLORS[grade?.status ?? 'DRAFT']}>{grade?.status ?? 'DRAFT'}</Tag>;
          }}
        />
      </Table>
    </>
  );

  return (
    <Container>
      <Subheading>Grading Matrix</Subheading>
      <Tabs
        items={[
          { key: 'milestones', label: 'Milestones', children: milestonesTabContent },
          { key: 'sprints', label: 'Sprints', children: sprintsTabContent },
        ]}
      />
    </Container>
  );
}
