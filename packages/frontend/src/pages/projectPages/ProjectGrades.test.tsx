import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '../../mocks/antd';

import ProjectGrades from './ProjectGrades';
import { Grade, GradeAuditLogEntry } from '../../api/types';

const mockMilestones = [
  { id: 1, name: 'Milestone 1', course_id: 1, start_date: '2022-01-01', deadline: '2022-02-01', max_marks: 100, created_at: '2022-01-01' },
  { id: 2, name: 'Milestone 2', course_id: 1, start_date: '2022-02-01', deadline: '2022-03-01', max_marks: 50, created_at: '2022-01-01' },
];

// grader_id 2 on both rows means user 2 is the assigned TA for both milestones.
const mockGrades: Grade[] = [
  {
    id: 1,
    project_id: 1,
    milestone_id: 1,
    sprint_id: null,
    score: 80,
    comment: 'Good work',
    status: 'PUBLISHED',
    grader_id: 2,
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
    score: 40,
    comment: null,
    status: 'DRAFT',
    grader_id: 2,
    created_at: '2022-01-01',
    updated_at: '2022-01-01',
    milestone: mockMilestones[1],
    sprint: null,
  },
];

const mockCourseUsers = [
  { user: { user_id: 2, user_display_name: 'Ta Person', user_email: 'ta@example.com' } },
];

// FACULTY_ROLE_ID is 1, STUDENT_ROLE_ID is 2 (see packages/frontend/src/api/role.ts).
const mockCourseUserRoles = [
  { user_id: 2, role_id: 1 }, // Ta Person - FACULTY, the assigned TA
  { user_id: 500, role_id: 1 }, // another faculty member, not the assigned TA
  { user_id: 1, role_id: 2 }, // a student
];

let mockUserInfo: { userId: number; userRoleActions: string[] } | undefined = { userId: 2, userRoleActions: [] };

const mockHandleUpsertMilestoneGrade = vi.fn();

const mockHistory: GradeAuditLogEntry[] = [
  {
    id: 1,
    project_id: 1,
    milestone_id: 1,
    sprint_id: null,
    score: 80,
    assigned_ta_id: null,
    action: 'MILESTONE_GRADE_PUBLISHED',
    comment: 'Good work',
    status: 'PUBLISHED',
    actor_id: 2,
    actor: { user_id: 2, user_display_name: 'Ta Person', user_email: 'ta@example.com' },
    created_at: '2022-01-02T00:00:00.000Z',
  },
  {
    id: 2,
    project_id: 1,
    milestone_id: 1,
    sprint_id: null,
    score: null,
    assigned_ta_id: 2,
    action: 'TA_ASSIGNED',
    comment: null,
    status: null,
    actor_id: 3,
    actor: { user_id: 3, user_display_name: 'Course Manager', user_email: 'manager@example.com' },
    created_at: '2022-01-01T00:00:00.000Z',
  },
  {
    id: 3,
    project_id: 1,
    milestone_id: 1,
    sprint_id: null,
    score: null,
    assigned_ta_id: null,
    action: 'MILESTONE_MAX_MARKS_UPDATED',
    comment: null,
    status: 'DRAFT',
    actor_id: 2,
    actor: { user_id: 2, user_display_name: 'Ta Person', user_email: 'ta@example.com' },
    created_at: '2022-01-03T00:00:00.000Z',
  },
];

const mockUseGetGradeHistoryQuery = vi.fn((_projectId: number, _options?: { skip?: boolean }) => ({
  data: mockHistory,
  isLoading: false,
}));

vi.mock('../../api/grade', () => ({
  useGetGradeHistoryQuery: (projectId: number, options?: { skip?: boolean }) =>
    mockUseGetGradeHistoryQuery(projectId, options),
}));

vi.mock('../../api/hooks', () => ({
  useProject: () => ({ project: { id: 1, course_id: 1 } }),
  useCourse: () => ({
    course: { id: 1, milestones: mockMilestones, users: mockCourseUsers },
    courseUserRoles: mockCourseUserRoles,
  }),
}));

vi.mock('../../api/auth', async () => {
  const actual = await vi.importActual<typeof import('../../api/auth')>('../../api/auth');
  return {
    ...actual,
    useGetUserInfoQuery: () => ({ data: mockUserInfo }),
  };
});

vi.mock('../../api/hooks/gradeHooks', () => ({
  useProjectGrades: () => ({
    grades: mockGrades,
    isLoading: false,
    handleUpsertMilestoneGrade: mockHandleUpsertMilestoneGrade,
    handleUpsertSprintGrade: vi.fn(),
  }),
}));

vi.mock('../../api/sprint', () => ({
  useGetSprintsByProjectIdQuery: () => ({ data: { sprints: [], unassignedBacklogs: [] }, isLoading: false }),
}));

describe('ProjectGrades', () => {
  beforeEach(() => {
    mockUserInfo = { userId: 2, userRoleActions: [] };
    mockHandleUpsertMilestoneGrade.mockClear();
    mockUseGetGradeHistoryQuery.mockClear();
  });

  const setup = (initialEntry = '/project/1/grades') =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="project/:projectId/grades" element={<ProjectGrades />} />
        </Routes>
      </MemoryRouter>,
    );

  it('opens the Sprints tab when the ?tab=sprints query param is present', () => {
    setup('/project/1/grades?tab=sprints');

    expect(screen.getByRole('tab', { name: 'Sprints' })).toHaveAttribute('aria-selected', 'true');
  });

  it('opens the Milestones tab by default', () => {
    setup();

    expect(screen.getByRole('tab', { name: 'Milestones' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows the assigned TA name for each milestone row', () => {
    setup();

    expect(screen.getAllByText('Ta Person', { exact: false }).length).toBeGreaterThan(0);
  });

  it('shows grades as read-only text on page load, with an Edit button, for the assigned TA', () => {
    setup();

    // mockUserInfo.userId (2) matches both grades' grader_id (2).
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('80 / 100', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Good work')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
  });

  it('clicking Edit makes that row editable (showing the total marks beside the Score field) and swaps the button to Save; other rows stay read-only', () => {
    setup();

    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[1]); // Milestone 2 row (max_marks 50)

    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(1); // only the other row's Edit remains
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    const scoreInput = screen.getByRole('spinbutton');
    expect(scoreInput).toHaveValue('40');
    expect(screen.getByText('/ 50', { exact: false })).toBeInTheDocument();

    const commentInput = screen.getByRole('textbox');
    expect(commentInput).toHaveValue('');
  });

  it('does not call the update API while typing — only when Save is clicked, after which the row returns to read-only', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);

    const scoreInput = screen.getByRole('spinbutton');
    fireEvent.change(scoreInput, { target: { value: '45' } });

    expect(mockHandleUpsertMilestoneGrade).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockHandleUpsertMilestoneGrade).toHaveBeenCalledWith(2, { score: 45, comment: '' });
    // Back to read-only: both rows show an Edit button again, no inputs.
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('shows an inline error and blocks Save when typing a score above the milestone max marks', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]); // Milestone 2, max_marks 50

    const scoreInput = screen.getByRole('spinbutton');
    fireEvent.change(scoreInput, { target: { value: '75' } });

    // Typing an over-limit value is allowed to commit (unlike `max`, which would silently
    // refuse the keystroke and leave nothing to validate) so it can be caught and surfaced here.
    expect(scoreInput).toHaveValue('75');
    expect(screen.getByText('Score must be between 0 and 50')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Save is blocked: no API call, and the row stays in edit mode with the error still shown.
    expect(mockHandleUpsertMilestoneGrade).not.toHaveBeenCalled();
    expect(screen.getByText('Score must be between 0 and 50')).toBeInTheDocument();
  });

  it('disables Save and shows an inline error when the score field is cleared', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);

    const scoreInput = screen.getByRole('spinbutton');
    fireEvent.change(scoreInput, { target: { value: '' } });

    expect(screen.getByText('Score is required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('rejects typing a negative score — the value is never committed, so Save is a no-op', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);

    const scoreInput = screen.getByRole('spinbutton');
    fireEvent.change(scoreInput, { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // min={0} still rejects a negative value outright, unlike max above.
    expect(mockHandleUpsertMilestoneGrade).not.toHaveBeenCalled();
  });

  it('shows an inline error and disables Save for a grade whose stored score is already out of range for the milestone', () => {
    const originalScore = mockGrades[1].score;
    mockGrades[1].score = 75; // Milestone 2's max_marks is 50
    try {
      setup();

      fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);

      expect(screen.getByText('Score must be between 0 and 50')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(mockHandleUpsertMilestoneGrade).not.toHaveBeenCalled();
    } finally {
      mockGrades[1].score = originalScore;
    }
  });

  it('clicking Save without making any change exits edit mode without calling the update API', () => {
    setup();

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockHandleUpsertMilestoneGrade).not.toHaveBeenCalled();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
  });

  it('shows grades as read-only text with no Edit/Save button for a faculty member who is not the assigned TA', () => {
    mockUserInfo = { userId: 999, userRoleActions: [] };
    setup();

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByText('80 / 100', { exact: false })).toBeInTheDocument();
  });

  it('lets an admin edit grades even when they are not the assigned TA', () => {
    mockUserInfo = { userId: 999, userRoleActions: ['admin'] };
    setup();

    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
  });

  it('shows a Grade History button next to the Grading header, closed by default', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Grade History' })).toBeInTheDocument();
    // The history table's contents are not rendered until the button is clicked.
    expect(screen.queryByText('MILESTONE_GRADE_PUBLISHED')).not.toBeInTheDocument();
  });

  it('opens a modal with the Grade History table when the Grade History button is clicked', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: 'Grade History' }));

    expect(screen.getAllByText('Ta Person', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText('Course Manager')).toBeInTheDocument();
    expect(screen.getByText('MILESTONE_GRADE_PUBLISHED')).toBeInTheDocument();
    expect(screen.getByText('TA_ASSIGNED')).toBeInTheDocument();
  });

  it('renders actor display name, action, and resulting value columns correctly for a milestone-grade event', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Grade History' }));

    expect(screen.getByText('Score: 80, Comment: Good work')).toBeInTheDocument();
  });

  it('shows which milestone each history entry relates to', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Grade History' }));

    // Both mockHistory entries have milestone_id 1 -> "Milestone 1".
    expect(screen.getAllByText('Milestone 1').length).toBeGreaterThan(0);
  });

  it('renders resulting value correctly for a TA_ASSIGNED event (no score)', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Grade History' }));

    expect(screen.getByText('Assigned TA: 2')).toBeInTheDocument();
  });

  it("renders resulting value correctly for a MILESTONE_MAX_MARKS_UPDATED event, showing the milestone's current max marks", () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Grade History' }));

    // mockHistory entry 3 has milestone_id 1, and mockMilestones[0].max_marks is 100.
    expect(screen.getByText('Max Marks: 100 (score/comment reset)')).toBeInTheDocument();
  });

  it('does not render the Grade History button/fetch grade history for a non-staff viewer', () => {
    mockUserInfo = { userId: 999, userRoleActions: [] };
    setup();

    expect(screen.queryByRole('button', { name: 'Grade History' })).not.toBeInTheDocument();
    expect(mockUseGetGradeHistoryQuery).toHaveBeenCalledWith(1, { skip: true });
  });

  it('does not fetch grade history for a student course role', () => {
    mockUserInfo = { userId: 1, userRoleActions: [] };
    setup();

    expect(screen.queryByRole('button', { name: 'Grade History' })).not.toBeInTheDocument();
    expect(mockUseGetGradeHistoryQuery).toHaveBeenCalledWith(1, { skip: true });
  });

  it('hides the Status column for a student, but shows it for faculty/admin', () => {
    mockUserInfo = { userId: 1, userRoleActions: [] }; // student
    const { unmount } = setup();

    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByText('PUBLISHED')).not.toBeInTheDocument();
    expect(screen.queryByText('DRAFT')).not.toBeInTheDocument();
    unmount();

    mockUserInfo = { userId: 2, userRoleActions: [] }; // the assigned TA, FACULTY
    setup();

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });

  it('lets a faculty member who is not the assigned TA view grade history, mirroring the backend permission, but not edit grades', () => {
    mockUserInfo = { userId: 500, userRoleActions: [] };
    setup();

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Grade History' })).toBeInTheDocument();
    expect(mockUseGetGradeHistoryQuery).toHaveBeenCalledWith(1, { skip: false });
  });
});
