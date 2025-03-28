import trofosApiSlice from '.';
import { PickRename } from '../helpers/types';
import {
  Course,
  CourseData,
  CourseDataResponse,
  CourseImportCsvPayload,
  CourseProjectsLatestInsights,
  Project,
  ProjectAssignmentImportPayload,
} from './types';

// Project management APIs
const extendedApi = trofosApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCourses: builder.query<{
        data: CourseData[],
        totalCount: number,
      }, {
        keyword?: string;
        sortBy?: string;
        pageIndex?: number;
        pageSize?: number;
        ids?: number[];
        option?: 'all' | 'past' | 'current' | 'future';
      }
    >({
      query: ({
        pageIndex,
        pageSize,
        keyword,
        sortBy,
        ids,
        option,
      }) => ({
        url: 'course/list',
        credentials: 'include',
        method: 'POST',
        body: {
          pageIndex,
          pageSize,
          keyword,
          sortBy,
          ids,
          option,
        }
      }),
      transformResponse: (response: {
        data: CourseDataResponse[],
        totalCount: number
      }) => {
        const transformedResponse: CourseData[] = response.data.map((courseData) => {
          return {
            ...courseData,
            users: courseData.courseRoles,
          };
        });
        return {
          data: transformedResponse,
          totalCount: response.totalCount,
        };
      },
      providesTags: (result, error, arg) =>
        result ? [...result.data.map(({ id }) => ({ type: 'Course' as const, id })), 'Course'] : ['Course'],
    }),

    getCourse: builder.query<CourseData, Pick<Course, 'id'>>({
      query: ({ id }) => `course//${id}`,
      transformResponse: (response: CourseDataResponse) => {
        const transformedResponse: CourseData = {
          ...response,
          users: response.courseRoles,
        };
        return transformedResponse;
      },
      providesTags: (result, error, { id }) => [{ type: 'Course', id }],
    }),

    // Adding a course will invalidate all courses
    addCourse: builder.mutation<
      Course,
      Partial<Course> & Pick<Course, 'cname' | 'code' | 'startYear' | 'startSem' | 'endYear' | 'endSem'>
    >({
      query: (course) => ({
        url: 'course/',
        method: 'POST',
        body: {
          courseCode: course.code,
          courseStartYear: course.startYear,
          courseStartSem: course.startSem,
          courseEndYear: course.endYear,
          courseEndSem: course.endSem,
          courseName: course.cname,
          isPublic: course.public,
          description: course.description,
        },
        credentials: 'include',
      }),
      invalidatesTags: ['Course'],
    }),

    // Updating a course will invalidate that course
    updateCourse: builder.mutation<
      Course,
      Pick<Course, 'id'> &
        Partial<
          Pick<Course, 'description' | 'cname' | 'public' | 'code' | 'startYear' | 'startSem' | 'endYear' | 'endSem'>
        >
    >({
      query: (param) => ({
        url: `course/${param.id}`,
        method: 'PUT',
        body: {
          courseCode: param.code,
          courseName: param.cname,
          courseStartYear: param.startYear,
          courseStartSem: param.startSem,
          courseEndYear: param.endYear,
          courseEndSem: param.endSem,
          description: param.description,
          isPublic: param.public,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }],
    }),

    // Removing a course will invalidate that course and all projects
    removeCourse: builder.mutation<Course, Pick<Course, 'id'>>({
      query: (param) => ({
        url: `course/${param.id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }, 'Project'],
    }),

    // Invalidate course
    addCourseUser: builder.mutation<Course, Pick<Course, 'id'> & { userEmail: string }>({
      query: (param) => ({
        url: `course/${param.id}/user`,
        method: 'POST',
        body: {
          userEmail: param.userEmail,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Course', id },
        { type: 'CourseRoles', id },
      ],
    }),

    // Invalidate course
    removeCourseUser: builder.mutation<Course, Pick<Course, 'id'> & { userId: number }>({
      query: (param) => ({
        url: `course/${param.id}/user`,
        method: 'DELETE',
        body: {
          userId: param.userId,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }],
    }),

    // Adding a project to a course will invalidate that course and all projects
    addProjectToCourse: builder.mutation<
      Course,
      PickRename<Course, 'id', 'courseId'> & PickRename<Project, 'id', 'projectId'>
    >({
      query: (param) => ({
        url: `course/${param.courseId}/project`,
        body: {
          projectId: param.projectId,
        },
        method: 'POST',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId, projectId }) => [
        { type: 'Course', id: courseId },
        { type: 'Project', id: projectId },
      ],
    }),

    // Removing a project to a course will invalidate that course and that project
    removeProjectFromCourse: builder.mutation<
      Course,
      PickRename<Course, 'id', 'courseId'> & PickRename<Project, 'id', 'projectId'>
    >({
      query: (param) => ({
        url: `course/${param.courseId}/project`,
        body: {
          projectId: param.projectId,
        },
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId, projectId }) => [
        { type: 'Course', id: courseId },
        { type: 'Project', id: projectId },
      ],
    }),

    // Removing a project to a course will invalidate all courses and all projects
    addProjectAndCourse: builder.mutation<
      Project,
      {
        courseCode?: string;
        courseYear?: number;
        courseSem?: number;
        courseName?: string;
        projectName: string;
        projectKey?: string;
        isCoursePublic?: boolean;
        isProjectPublic?: boolean;
        projectDescription?: string;
      }
    >({
      query: (body) => ({
        url: 'course/project',
        method: 'POST',
        body,
        credentials: 'include',
      }),
      invalidatesTags: ['Course', 'Project'],
    }),

    // Bulk creation of course will invalidate all Courses, all Projects, and all Users
    bulkCreateProjects: builder.mutation<
      Course,
      {
        courseId?: string;
        courseYear?: number;
        courseSem?: number;
        courseName?: string;
        isPublic?: boolean;
        projects: {
          projectName: string;
          projectKey?: string;
          isPublic?: boolean;
          description?: string;
          users: {
            userId: number;
          }[];
        }[];
      }
    >({
      query: (body) => ({
        url: 'course/bulk',
        method: 'POST',
        body,
        credentials: 'include',
      }),
      invalidatesTags: ['Course', 'Project', 'User'],
    }),

    createMilestone: builder.mutation<
      Course,
      {
        courseId: string;
        milestoneName: string;
        milestoneStartDate: Date;
        milestoneDeadline: Date;
      }
    >({
      query: (params) => ({
        url: `course/${params.courseId}/milestone`,
        method: 'POST',
        body: {
          milestoneName: params.milestoneName,
          milestoneStartDate: params.milestoneStartDate.toString(),
          milestoneDeadline: params.milestoneDeadline.toString(),
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', courseId }],
    }),

    deleteMilestone: builder.mutation<
      Course,
      {
        courseId: string;
        milestoneId: number;
      }
    >({
      query: (params) => ({
        url: `course/${params.courseId}/milestone/${params.milestoneId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', courseId }],
    }),

    updateMilestone: builder.mutation<
      Course,
      {
        courseId: string;
        milestoneId: number;
        payload: {
          milestoneName?: string;
          milestoneStartDate?: Date;
          milestoneDeadline?: Date;
        };
      }
    >({
      query: (params) => ({
        url: `course/${params.courseId}/milestone/${params.milestoneId}`,
        method: 'PUT',
        body: {
          ...params.payload,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', courseId }],
    }),

    createAnnouncement: builder.mutation<
      Course,
      {
        courseId: string;
        payload: {
          announcementTitle: string;
          announcementContent: string;
        };
      }
    >({
      query: (params) => ({
        url: `course/${params.courseId}/announcement`,
        method: 'POST',
        body: {
          ...params.payload,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', courseId }],
    }),

    deleteAnnouncement: builder.mutation<
      Course,
      {
        courseId: string;
        announcementId: number;
      }
    >({
      query: (params) => ({
        url: `course/${params.courseId}/announcement/${params.announcementId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', courseId }],
    }),

    updateAnnouncement: builder.mutation<
      Course,
      {
        courseId: string;
        announcementId: number;
        payload: {
          announcementTitle?: string;
          announcementContent?: string;
        };
      }
    >({
      query: (params) => ({
        url: `course/${params.courseId}/announcement/${params.announcementId}`,
        method: 'PUT',
        body: {
          ...params.payload,
        },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', courseId }],
    }),
    importCsv: builder.mutation<void, CourseImportCsvPayload>({
      query: (params) => ({
        url: `course/${params.courseId}/import/csv`,
        method: 'POST',
        body: params.payload,
        credentials: 'include',
      }),
    }),

    // Archiving a course will invalidate that course
    archiveCourse: builder.mutation<Course, Pick<Course, 'id'>>({
      query: (course) => ({
        url: `course/${course.id}/archive`,
        method: 'PUT',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg.id }, 'Project'],
    }),

    // Unarchiving a course will invalidate that course
    unarchiveCourse: builder.mutation<Course, Pick<Course, 'id'>>({
      query: (course) => ({
        url: `course/${course.id}/unarchive`,
        method: 'PUT',
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Course', id: arg.id }, 'Project'],
    }),

    // Import project assignments via csv
    importProjectAssignments: builder.mutation<void, ProjectAssignmentImportPayload>({
      query: (params) => ({
        url: `course/${params.courseId}/import/projectAssignments`,
        method: 'POST',
        body: params.payload,
        credentials: 'include',
      }),
      invalidatesTags: ['Project'],
    }),

    // Get latest insights of all projects in this course
    getCourseProjectsLatestInsights: builder.query<CourseProjectsLatestInsights[], number>({
      query: (id) => ({
        url: `course/${id}/sprintInsights/latest`,
        credentials: 'include',
      }),
      providesTags: (result, error, id) => [{ type: 'CourseProjectsLatestInsights', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddCourseMutation,
  useGetAllCoursesQuery,
  useGetCourseQuery,
  useUpdateCourseMutation,
  useRemoveCourseMutation,
  useAddCourseUserMutation,
  useRemoveCourseUserMutation,
  useAddProjectAndCourseMutation,
  useRemoveProjectFromCourseMutation,
  useAddProjectToCourseMutation,
  useBulkCreateProjectsMutation,
  useCreateMilestoneMutation,
  useDeleteMilestoneMutation,
  useUpdateMilestoneMutation,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useImportCsvMutation,
  useArchiveCourseMutation,
  useUnarchiveCourseMutation,
  useImportProjectAssignmentsMutation,
  useGetCourseProjectsLatestInsightsQuery,
} = extendedApi;
