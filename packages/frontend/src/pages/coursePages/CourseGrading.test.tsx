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
    score: 80,
    comment: 'Good work',
    status: 'PUBLISHED',
    grader_id: 1,
    created_at: '2022-01-01',
    updated_at: '2022-01-01',
    milestone: mockMilestones[0],
  },
  {
    id: 2,
    project_id: 1,
    milestone_id: 2,
    score: null,
    comment: null,
    status: 'DRAFT',
    grader_id: 5,
    created_at: '2022-01-01',
    updated_at: '2022-01-01',
    milestone: mockMilestones[1],
  },
];

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

// Bypass the real confirmation modal so tests can assert on the resulting API call directly.
vi.mock('../../components/modals/confirm', () => ({
  confirmPublishGrades: (onOk: () => Promise<void>) => onOk(),
  confirmUnpublishGrades: (onOk: () => Promise<void>) => onOk(),
}));

const mockHandlePublishGrade = vi.fn();
const mockHandleUnpublishGrade = vi.fn();
const mockHandleAssignTa = vi.fn();

vi.mock('../../api/hooks/gradeHooks', () => ({
  useCourseGrades: () => ({
    grades: mockGrades,
    isLoading: false,
    handlePublishGrade: mockHandlePublishGrade,
    handleUnpublishGrade: mockHandleUnpublishGrade,
    handleAssignTa: mockHandleAssignTa,
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

  it('publishes only the checked rows that have a grade for the selected milestone (project2 has none, so it is skipped)', () => {
    isCourseManagerValue = true;
    setup();

    const table = screen.getByRole('table');
    // Row checkboxes: [0] is the "select all" header checkbox, [1]/[2] are project1/project2.
    const rowCheckboxes = within(table).getAllByRole('checkbox');
    fireEvent.click(rowCheckboxes[1]);
    fireEvent.click(rowCheckboxes[2]);

    // Default selection is Milestone 2: only project1 has a Grade row for it (id 2).
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(mockHandlePublishGrade).toHaveBeenCalledTimes(1);
    expect(mockHandlePublishGrade).toHaveBeenCalledWith(1, 2);
  });

  it('unpublishes only the checked rows that have a grade for the selected milestone', () => {
    isCourseManagerValue = true;
    setup();

    const table = screen.getByRole('table');
    const rowCheckboxes = within(table).getAllByRole('checkbox');
    fireEvent.click(rowCheckboxes[1]);
    fireEvent.click(rowCheckboxes[2]);

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));

    expect(mockHandleUnpublishGrade).toHaveBeenCalledTimes(1);
    expect(mockHandleUnpublishGrade).toHaveBeenCalledWith(1, 2);
  });
});
