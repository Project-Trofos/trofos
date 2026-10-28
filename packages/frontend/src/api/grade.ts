import trofosApiSlice from '.';
import { Grade, GradeAuditLogEntry } from './types';

const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGradesByCourse: builder.query<{ grades: Grade[] }, number>({
      query: (courseId) => ({
        url: `course/${courseId}/grade`,
        credentials: 'include',
      }),
      providesTags: ['Grade'],
    }),

    getGradesByProject: builder.query<{ grades: Grade[] }, number>({
      query: (projectId) => ({
        url: `project/${projectId}/grade`,
        credentials: 'include',
      }),
      providesTags: ['Grade'],
    }),

    getGradeHistory: builder.query<GradeAuditLogEntry[], number>({
      query: (projectId) => ({
        url: `project/${projectId}/grade/history`,
        credentials: 'include',
      }),
      providesTags: ['Grade'],
    }),

    upsertMilestoneGrade: builder.mutation<
      Grade,
      { projectId: number; milestoneId: number; score?: number; comment?: string }
    >({
      query: ({ projectId, milestoneId, ...payload }) => ({
        url: `project/${projectId}/milestone/${milestoneId}/grade`,
        method: 'PUT',
        body: payload,
        credentials: 'include',
      }),
      invalidatesTags: ['Grade'],
    }),

    publishGrade: builder.mutation<Grade, { projectId: number; gradeId: number }>({
      query: ({ projectId, gradeId }) => ({
        url: `project/${projectId}/grade/${gradeId}/publish`,
        method: 'PUT',
        credentials: 'include',
      }),
      invalidatesTags: ['Grade'],
    }),

    unpublishGrade: builder.mutation<Grade, { projectId: number; gradeId: number }>({
      query: ({ projectId, gradeId }) => ({
        url: `project/${projectId}/grade/${gradeId}/unpublish`,
        method: 'PUT',
        credentials: 'include',
      }),
      invalidatesTags: ['Grade'],
    }),

    assignTa: builder.mutation<Grade, { projectId: number; milestoneId: number; assignedTaId: number | null }>({
      query: ({ projectId, milestoneId, assignedTaId }) => ({
        url: `project/${projectId}/milestone/${milestoneId}/grade/assign-ta`,
        method: 'PUT',
        body: { assignedTaId },
        credentials: 'include',
      }),
      invalidatesTags: ['Grade'],
    }),

    upsertSprintGrade: builder.mutation<Grade, { projectId: number; sprintId: number; score?: number; comment?: string }>({
      query: ({ projectId, sprintId, ...payload }) => ({
        url: `project/${projectId}/sprint/${sprintId}/grade`,
        method: 'PUT',
        body: payload,
        credentials: 'include',
      }),
      invalidatesTags: ['Grade'],
    }),

    assignTaForSprint: builder.mutation<Grade, { projectId: number; sprintId: number; assignedTaId: number | null }>({
      query: ({ projectId, sprintId, assignedTaId }) => ({
        url: `project/${projectId}/sprint/${sprintId}/grade/assign-ta`,
        method: 'PUT',
        body: { assignedTaId },
        credentials: 'include',
      }),
      invalidatesTags: ['Grade'],
    }),

    bulkSetSprintMaxMarks: builder.mutation<
      { updatedCount: number },
      { courseId: number; sprintIds: number[]; maxMarks: number; confirm?: boolean }
    >({
      query: ({ courseId, confirm, ...body }) => ({
        url: `course/${courseId}/sprint/grade/max-marks${confirm ? '?confirm=true' : ''}`,
        method: 'PUT',
        body,
        credentials: 'include',
      }),
      invalidatesTags: ['Grade', 'Sprint'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGradesByCourseQuery,
  useGetGradesByProjectQuery,
  useGetGradeHistoryQuery,
  useUpsertMilestoneGradeMutation,
  usePublishGradeMutation,
  useUnpublishGradeMutation,
  useAssignTaMutation,
  useUpsertSprintGradeMutation,
  useAssignTaForSprintMutation,
  useBulkSetSprintMaxMarksMutation,
} = extendedApi;
