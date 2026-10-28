import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '../../mocks/antd';

import CourseGrading from './CourseGrading';
import { Grade } from '../../api/types';

const mockMilestones = [
  { id: 1, name: 'Milestone 1', course_id: 1, start_date: '2022-01-01', deadline: '2022-02-01', max_marks: 100, created_at: '2022-01-01' },
  { id: 2, name: 'Milestone 2', course_id: 1, start_date: '2022-02-01', deadline: '2022-03-01', max_marks: 50, created_at: '2022-01-01' },
];

const mockProjects = [
  { id: 1, pname: 'project1', pkey: null, description: null, course_id: 1, public: false, created_at: '2022-01-01', is_archive: false },
  { id: 2, pname: 'project2', pkey: null, description: null, course_id: 1, public: false, created_at: '2022-01-01', is_archive: false },
];

// project1 has a score for Milestone 1, and is assigned Jane TA (grader_id) for Milestone 2
// (the default-selected milestone); project2 has no Grade row for Milestone 2 -> unassigned.
const mockGrades: Grade[] = [
  {
    id: 1,
    project_id: 1,
    milestone_id: 1,
    sprint_id: null,
    score: 80,
    comment: 'Good work',
    status: 'PUBLISHED',
    grader_id: 1,
    created_at: '2022-01-01',
    updated_at: '2022-01-01',
    milestone: mockMilestones[0],
    sprint: null,
  },
  {
    id: 2,
    project_id: 1,
    milestone_id: 2,
    sprint_id: null,
    score: 30,
    comment: null,
    status: 'DRAFT',
    grader_id: 5,
    created_at: '2022-01-01',
    updated_at: '2022-01-01',
    milestone: mockMilestones[1],
    sprint: null,
  },
];

// project1's sprint is gradable (max_marks set) and already has a DRAFT grade assigned to Jane
// TA; project2's sprint has never had its total marks set, so it's not gradable yet.
const mockSprints = [
  {
    id: 101,
    name: 'Sprint 1',
    duration: 1,
    goals: null,
    start_date: '2022-01-01',
    end_date: '2022-01-14',
    project_id: 1,
    status: 'closed' as const,
    backlogs: [],
    max_marks: 50,
  },
  {
    id: 102,
    name: 'Sprint 1',
    duration: 1,
    goals: null,
    start_date: '2022-01-01',
    end_date: '2022-01-14',
    project_id: 2,
    status: 'closed' as const,
    backlogs: [],
    max_marks: null,
  },
];

mockGrades.push({
  id: 3,
  project_id: 1,
  milestone_id: null,
  sprint_id: 101,
  score: 30,
  comment: 'nice',
  status: 'DRAFT',
  grader_id: 5,
  created_at: '2022-01-01',
  updated_at: '2022-01-01',
  milestone: null,
  sprint: mockSprints[0],
});

const mockHandleUpdateMilestone = vi.fn();
let isCourseManagerValue = false;

const mockCourseUsers = [{ user: { user_id: 5, user_display_name: 'Jane TA', user_email: 'jane@example.com' } }];
const mockCourseUserRoles = [{ user_id: 5, role_id: 1 }];

vi.mock('../../api/hooks', () => ({
  useCourse: () => ({
    course: { id: 1, milestones: mockMilestones, users: mockCourseUsers },
    filteredProjects: mockProjects,
    courseUserRoles: mockCourseUserRoles,
    handleUpdateMilestone: mockHandleUpdateMilestone,
  }),
}));

vi.mock('../../api/hooks/roleHooks', () => ({
  useIsCourseManager: () => ({ isCourseManager: isCourseManagerValue }),
}));

vi.mock('../../api/sprint', () => ({
  useGetSprintsByCourseIdQuery: () => ({ data: mockSprints, isLoading: false }),
}));

// Bypass the real confirmation modal so tests can assert on the resulting API call directly.
vi.mock('../../components/modals/confirm', () => ({
  confirmPublishGrades: (onOk: () => Promise<void>) => onOk(),
  confirmUnpublishGrades: (onOk: () => Promise<void>) => onOk(),
}));

const mockHandlePublishGrade = vi.fn();
const mockHandleUnpublishGrade = vi.fn();
const mockHandleAssignTa = vi.fn();
const mockHandleAssignTaForSprint = vi.fn();
const mockHandleBulkSetSprintMaxMarks = vi.fn();

vi.mock('../../api/hooks/gradeHooks', () => ({
  useCourseGrades: () => ({
    grades: mockGrades,
    isLoading: false,
    handlePublishGrade: mockHandlePublishGrade,
    handleUnpublishGrade: mockHandleUnpublishGrade,
    handleAssignTa: mockHandleAssignTa,
    handleAssignTaForSprint: mockHandleAssignTaForSprint,
    handleBulkSetSprintMaxMarks: mockHandleBulkSetSprintMaxMarks,
  }),
}));

describe('CourseGrading', () => {
  beforeEach(() => {
    isCourseManagerValue = false;
    mockHandleUpdateMilestone.mockClear();
    mockHandlePublishGrade.mockClear();
    mockHandleUnpublishGrade.mockClear();
    mockHandleAssignTa.mockClear();
  });

  const setup = (initialEntry = '/course/1/grading') =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="course/:courseId/grading" element={<CourseGrading />} />
        </Routes>
      </MemoryRouter>,
    );

  it('renders the grading matrix with a milestone dropdown defaulting to the latest milestone', () => {
    setup();

    expect(screen.getByText('Grading Matrix')).toBeInTheDocument();
    expect(screen.getByText('project1')).toBeInTheDocument();
    expect(screen.getByText('Export to CSV')).toBeInTheDocument();

    // Milestone 2 starts later than Milestone 1, so it's the default selection,
    // and only its column (not Milestone 1's) should be shown.
    expect(screen.getByText('Milestone 2 (/50)')).toBeInTheDocument();
    expect(screen.queryByText('Milestone 1 (/100)')).not.toBeInTheDocument();
  });

  it('pre-selects the milestone named in the ?milestoneId= query param, overriding the latest-milestone default', () => {
    setup('/course/1/grading?milestoneId=1');

    expect(screen.getByText('Milestone 1 (/100)')).toBeInTheDocument();
    expect(screen.queryByText('Milestone 2 (/50)')).not.toBeInTheDocument();
  });

  it("links each project name to that project's own Grading page", () => {
    setup();

    const link = screen.getByRole('link', { name: 'project1' });
    expect(link).toHaveAttribute('href', '/project/1/grades');

    const link2 = screen.getByRole('link', { name: 'project2' });
    expect(link2).toHaveAttribute('href', '/project/2/grades');
  });

  it('shows a tooltip explaining the project name link on hover', async () => {
    setup();

    fireEvent.mouseEnter(screen.getByRole('link', { name: 'project1' }));

    expect(await screen.findByText("Click to view this project's Grading page")).toBeInTheDocument();
  });

  it('switches the shown milestone column when a different milestone is selected', () => {
    setup();

    const dropdowns = screen.getAllByRole('combobox');
    // The milestone selector is the first combobox on the page.
    fireEvent.change(dropdowns[0], { target: { value: '1' } });

    expect(screen.getByText('Milestone 1 (/100)')).toBeInTheDocument();
    expect(screen.queryByText('Milestone 2 (/50)')).not.toBeInTheDocument();
  });

  it('hides the Publish/Unpublish buttons for non-managers', () => {
    setup();

    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unpublish' })).not.toBeInTheDocument();
  });

  it('shows the score, comment, and status of the selected milestone as read-only text, with no edit controls', () => {
    isCourseManagerValue = true;
    setup();

    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: '1' } });

    expect(screen.getByText('80 / 100', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Good work')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();

    // The only spinbutton left is the Total Marks field — no editable score input,
    // comment field/modal, or per-row Save button for the grade cell, even for a course
    // manager — grading is only editable at project level now.
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Comment' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('shows the selected milestone\'s max marks in the Total Marks field, next to the milestone selector', () => {
    setup();

    expect(screen.getByText('Select Milestone')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();

    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: '1' } });

    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('disables the Total Marks field and Save button for non-managers', () => {
    setup();

    expect(screen.getByDisplayValue('50')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save Total Marks' })).toBeDisabled();
  });

  it('does not call the milestone update API while typing Total Marks — only when Save Total Marks is clicked', () => {
    isCourseManagerValue = true;
    setup();

    const maxMarksInput = screen.getByDisplayValue('50');
    fireEvent.change(maxMarksInput, { target: { value: '75' } });

    expect(mockHandleUpdateMilestone).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Save Total Marks' }));

    expect(mockHandleUpdateMilestone).toHaveBeenCalledWith(2, { milestoneMaxMarks: 75 });
  });

  it('keeps the Save Total Marks button disabled until the draft actually differs from the saved value', () => {
    isCourseManagerValue = true;
    setup();

    expect(screen.getByRole('button', { name: 'Save Total Marks' })).toBeDisabled();
  });

  it('disables the Total Marks field and Save button for a manager when the selected milestone has a published grade', () => {
    isCourseManagerValue = true;
    setup();

    // Milestone 1 has a PUBLISHED grade (project1); Milestone 2 (the default) does not.
    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: '1' } });

    expect(screen.getByDisplayValue('100')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save Total Marks' })).toBeDisabled();
  });

  it('shows a tooltip explaining why Total Marks is locked when the selected milestone has a published grade', async () => {
    isCourseManagerValue = true;
    setup();

    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: '1' } });

    fireEvent.mouseEnter(screen.getByDisplayValue('100'));

    expect(await screen.findByText(/cannot be changed while any grade for this milestone is published/i)).toBeInTheDocument();
  });

  it('does not disable Total Marks for a manager when the selected milestone has no published grades', () => {
    isCourseManagerValue = true;
    setup();

    // Default selection is Milestone 2, which only has a DRAFT grade.
    expect(screen.getByDisplayValue('50')).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save Total Marks' })).toBeDisabled(); // no draft change yet
  });

  it('renders the Assigned TA column as read-only text, scoped to the selected milestone, for both managers and non-managers', () => {
    const { unmount } = setup();
    const table = screen.getByRole('table');
    expect(within(table).queryAllByRole('combobox')).toHaveLength(0);
    // Default milestone is Milestone 2: project1 -> Jane TA, project2 -> Unassigned.
    expect(within(table).getByText('Jane TA')).toBeInTheDocument();
    expect(within(table).getByText('Unassigned')).toBeInTheDocument();
    unmount();

    isCourseManagerValue = true;
    setup();
    const managerTable = screen.getByRole('table');
    expect(within(managerTable).queryAllByRole('combobox')).toHaveLength(0);
  });

  it('shows a workload hint and an unassigned-projects summary for managers, scoped to the selected milestone', () => {
    isCourseManagerValue = true;
    setup();

    // Default milestone is Milestone 2: project1 -> Jane TA, project2 -> unassigned.
    expect(screen.getByText('1 of 2 projects unassigned')).toBeInTheDocument();
    expect(screen.getAllByText('Jane TA (1 project)').length).toBeGreaterThan(0);
  });

  it('hides the unassigned summary and bulk-assign toolbar for non-managers', () => {
    setup();

    expect(screen.queryByText(/projects unassigned/)).not.toBeInTheDocument();
    expect(screen.queryByText('Assign selected to')).not.toBeInTheDocument();
  });

  it('filters to unassigned projects only when the checkbox is checked', () => {
    isCourseManagerValue = true;
    setup();

    expect(screen.getByText('project1')).toBeInTheDocument();
    expect(screen.getByText('project2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Show unassigned only'));

    expect(screen.queryByText('project1')).not.toBeInTheDocument();
    expect(screen.getByText('project2')).toBeInTheDocument();
  });

  it('bulk-assigns the selected TA to all checked rows, scoped to the selected milestone', () => {
    isCourseManagerValue = true;
    setup();

    const table = screen.getByRole('table');
    // Row checkboxes: [0] is the "select all" header checkbox, [1]/[2] are project1/project2.
    const rowCheckboxes = within(table).getAllByRole('checkbox');
    fireEvent.click(rowCheckboxes[1]);
    fireEvent.click(rowCheckboxes[2]);

    // Combobox order: [0] milestone selector, [1] bulk-assign TA select.
    const bulkAssignSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(bulkAssignSelect, { target: { value: '5' } });

    fireEvent.click(screen.getByRole('button', { name: 'Assign' }));

    // Default selection is Milestone 2 (id 2).
    expect(mockHandleAssignTa).toHaveBeenCalledTimes(2);
    expect(mockHandleAssignTa).toHaveBeenCalledWith(1, 2, 5);
    expect(mockHandleAssignTa).toHaveBeenCalledWith(2, 2, 5);
  });

  it('does not show a per-row Publish/Unpublish button — publishing is only available via the Publish/Unpublish buttons', () => {
    isCourseManagerValue = true;
    setup();

    expect(screen.getAllByRole('button', { name: 'Publish' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Unpublish' })).toHaveLength(1);
  });

  it('disables Publish/Unpublish until at least one checked row has a grade for the selected milestone', () => {
    isCourseManagerValue = true;
    setup();

    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Unpublish' })).toBeDisabled();
  });

  it('enables and performs Publish only when every selected row has a scored grade for the selected milestone', () => {
    isCourseManagerValue = true;
    setup();

    const table = screen.getByRole('table');
    // Row checkboxes: [0] is the "select all" header checkbox, [1] is project1.
    const rowCheckboxes = within(table).getAllByRole('checkbox');
    fireEvent.click(rowCheckboxes[1]);

    // Default selection is Milestone 2: project1 has a scored Grade row for it (id 2, score 30).
    expect(screen.getByRole('button', { name: 'Publish' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(mockHandlePublishGrade).toHaveBeenCalledTimes(1);
    expect(mockHandlePublishGrade).toHaveBeenCalledWith(1, 2);
  });

  it('disables Publish and Unpublish when any selected project has no grade for the selected milestone', () => {
    isCourseManagerValue = true;
    setup();

    const table = screen.getByRole('table');
    // Row checkboxes: [0] is the "select all" header checkbox, [1]/[2] are project1/project2.
    const rowCheckboxes = within(table).getAllByRole('checkbox');
    fireEvent.click(rowCheckboxes[1]);
    fireEvent.click(rowCheckboxes[2]);

    // Default selection is Milestone 2: project2 has no Grade row for it, so neither action
    // can apply to "all selected" rows.
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Unpublish' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));
    expect(mockHandlePublishGrade).not.toHaveBeenCalled();
    expect(mockHandleUnpublishGrade).not.toHaveBeenCalled();
  });

  it('disables Publish when the only selected row has not been scored yet', () => {
    isCourseManagerValue = true;
    const originalScore = mockGrades[1].score;
    mockGrades[1].score = null;
    try {
      setup();

      const table = screen.getByRole('table');
      const rowCheckboxes = within(table).getAllByRole('checkbox');
      fireEvent.click(rowCheckboxes[1]);

      expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
      expect(mockHandlePublishGrade).not.toHaveBeenCalled();
    } finally {
      mockGrades[1].score = originalScore;
    }
  });

  it('disables Unpublish when the only selected row is still DRAFT', () => {
    isCourseManagerValue = true;
    setup();

    const table = screen.getByRole('table');
    const rowCheckboxes = within(table).getAllByRole('checkbox');
    fireEvent.click(rowCheckboxes[1]);

    // Default selection is Milestone 2: project1's grade (id 2) is DRAFT, not PUBLISHED.
    expect(screen.getByRole('button', { name: 'Unpublish' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));
    expect(mockHandleUnpublishGrade).not.toHaveBeenCalled();
  });

  it('enables and performs Unpublish only when every selected row is already PUBLISHED', () => {
    isCourseManagerValue = true;
    setup();

    // Switch to Milestone 1, whose only grade (project1, id 1) is already PUBLISHED.
    const dropdowns = screen.getAllByRole('combobox');
    fireEvent.change(dropdowns[0], { target: { value: '1' } });

    const table = screen.getByRole('table');
    const rowCheckboxes = within(table).getAllByRole('checkbox');
    fireEvent.click(rowCheckboxes[1]);

    expect(screen.getByRole('button', { name: 'Unpublish' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));

    expect(mockHandleUnpublishGrade).toHaveBeenCalledTimes(1);
    expect(mockHandleUnpublishGrade).toHaveBeenCalledWith(1, 1);
  });

  describe('Sprints tab', () => {
    beforeEach(() => {
      mockHandleAssignTaForSprint.mockClear();
      mockHandleBulkSetSprintMaxMarks.mockClear();
    });

    it('lists every (project, sprint) pair across the course, flattened, with project2\'s ungraded sprint shown as not gradable yet', () => {
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      const table = screen.getByRole('table');
      expect(within(table).getByText('project1')).toBeInTheDocument();
      expect(within(table).getByText('project2')).toBeInTheDocument();
      expect(within(table).getByText('Not gradable yet')).toBeInTheDocument();
    });

    it('shows an unassigned-sprints summary for managers, counting sprints with no assigned TA', () => {
      isCourseManagerValue = true;
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      expect(screen.getByText('1 of 2 sprints unassigned')).toBeInTheDocument();
    });

    it('hides the unassigned-sprints summary and bulk-assign toolbar for non-managers', () => {
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      expect(screen.queryByText(/sprints unassigned/)).not.toBeInTheDocument();
      expect(screen.queryByText('Assign selected to')).not.toBeInTheDocument();
    });

    it('filters to unassigned sprints only when the checkbox is checked', () => {
      isCourseManagerValue = true;
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      const panel = screen.getByRole('tabpanel');
      expect(within(panel).getByText('project1')).toBeInTheDocument();
      expect(within(panel).getByText('project2')).toBeInTheDocument();

      fireEvent.click(within(panel).getByText('Show unassigned only'));

      expect(within(panel).queryByText('project1')).not.toBeInTheDocument();
      expect(within(panel).getByText('project2')).toBeInTheDocument();
    });

    it('shows the existing sprint grade score, comment, status, and assigned TA', () => {
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      expect(screen.getAllByText('30 / 50', { exact: false }).length).toBeGreaterThan(0);
      expect(screen.getAllByText('nice').length).toBeGreaterThan(0);
      expect(screen.getAllByText('DRAFT').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jane TA', { exact: false }).length).toBeGreaterThan(0);
    });

    it('bulk-sets total marks for the selected sprints across different projects', () => {
      isCourseManagerValue = true;
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      const table = screen.getByRole('table');
      const rowCheckboxes = within(table).getAllByRole('checkbox');
      fireEvent.click(rowCheckboxes[1]); // project1's sprint
      fireEvent.click(rowCheckboxes[2]); // project2's sprint

      const maxMarksInput = screen.getByRole('spinbutton');
      fireEvent.change(maxMarksInput, { target: { value: '75' } });
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Selected' }));

      expect(mockHandleBulkSetSprintMaxMarks).toHaveBeenCalledWith([101, 102], 75);
    });

    it('bulk-assigns the selected TA to the selected sprint rows', () => {
      isCourseManagerValue = true;
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      const table = screen.getByRole('table');
      const rowCheckboxes = within(table).getAllByRole('checkbox');
      fireEvent.click(rowCheckboxes[1]);
      fireEvent.click(rowCheckboxes[2]);

      const bulkAssignSelect = screen.getAllByRole('combobox').slice(-1)[0];
      fireEvent.change(bulkAssignSelect, { target: { value: '5' } });
      fireEvent.click(screen.getByRole('button', { name: 'Assign' }));

      expect(mockHandleAssignTaForSprint).toHaveBeenCalledTimes(2);
      expect(mockHandleAssignTaForSprint).toHaveBeenCalledWith(1, 101, 5);
      expect(mockHandleAssignTaForSprint).toHaveBeenCalledWith(2, 102, 5);
    });

    it('enables and performs Publish only when every selected sprint has a scored grade', () => {
      isCourseManagerValue = true;
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      const table = screen.getByRole('table');
      const rowCheckboxes = within(table).getAllByRole('checkbox');
      fireEvent.click(rowCheckboxes[1]); // project1's sprint (101), already scored

      expect(screen.getByRole('button', { name: 'Publish' })).not.toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

      expect(mockHandlePublishGrade).toHaveBeenCalledWith(1, 3);
    });

    it('disables Publish and Unpublish when any selected sprint has no grade', () => {
      isCourseManagerValue = true;
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      const table = screen.getByRole('table');
      const rowCheckboxes = within(table).getAllByRole('checkbox');
      fireEvent.click(rowCheckboxes[1]);
      fireEvent.click(rowCheckboxes[2]); // project2's sprint (102) has no Grade row

      expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Unpublish' })).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
      fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));
      expect(mockHandlePublishGrade).not.toHaveBeenCalled();
      expect(mockHandleUnpublishGrade).not.toHaveBeenCalled();
    });

    it('disables Publish when the only selected sprint grade has not been scored yet', () => {
      isCourseManagerValue = true;
      const sprintGrade = mockGrades.find((g) => g.id === 3);
      const originalScore = sprintGrade?.score;
      if (sprintGrade) {
        sprintGrade.score = null;
      }
      try {
        setup();
        fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

        const table = screen.getByRole('table');
        const rowCheckboxes = within(table).getAllByRole('checkbox');
        fireEvent.click(rowCheckboxes[1]);

        expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
        expect(mockHandlePublishGrade).not.toHaveBeenCalled();
      } finally {
        if (sprintGrade) {
          sprintGrade.score = originalScore ?? null;
        }
      }
    });

    it('disables Unpublish when the only selected sprint grade is still DRAFT', () => {
      isCourseManagerValue = true;
      setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

      const table = screen.getByRole('table');
      const rowCheckboxes = within(table).getAllByRole('checkbox');
      fireEvent.click(rowCheckboxes[1]); // project1's sprint grade (id 3) is DRAFT

      expect(screen.getByRole('button', { name: 'Unpublish' })).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));
      expect(mockHandleUnpublishGrade).not.toHaveBeenCalled();
    });

    it('enables and performs Unpublish only when every selected sprint grade is already PUBLISHED', () => {
      isCourseManagerValue = true;
      const sprintGrade = mockGrades.find((g) => g.id === 3);
      const originalStatus = sprintGrade?.status;
      if (sprintGrade) {
        sprintGrade.status = 'PUBLISHED';
      }
      try {
        setup();
        fireEvent.click(screen.getByRole('tab', { name: 'Sprints' }));

        const table = screen.getByRole('table');
        const rowCheckboxes = within(table).getAllByRole('checkbox');
        fireEvent.click(rowCheckboxes[1]);

        expect(screen.getByRole('button', { name: 'Unpublish' })).not.toBeDisabled();
        fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));

        expect(mockHandleUnpublishGrade).toHaveBeenCalledWith(1, 3);
      } finally {
        if (sprintGrade && originalStatus) {
          sprintGrade.status = originalStatus;
        }
      }
    });
  });
});
