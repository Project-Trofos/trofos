import React, { useCallback, useMemo, useState } from 'react';
import { Form, Segmented, Select, Typography, message } from 'antd';
import { Dayjs } from 'dayjs';
import { useAddProjectMutation } from '../../api/project';
import { useAddProjectAndCourseMutation, useGetAllCoursesQuery } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';
import { useGetAllModulesQuery } from '../../api/nusmods';
import { getErrorMessage } from '../../helpers/error';
import CourseYearSemFormItems from '../forms/CourseYearSemFormItems';
import SelectCourseCodeFormItem from '../forms/SelectCourseCodeFormItem';
import CourseCodeFormItem from '../forms/CourseCodeFormItem';
import CourseNameFormItem from '../forms/CourseNameFormItem';
import ProjectNameFormInput from '../forms/ProjectNameFormItem';
import ProjectKeyFormInput from '../forms/ProjectKeyFormItem';
import { Course } from '../../api/types';

const { Option } = Select;

/**
 * Modal for creating projects
 * @param course course that the project will attach to, skips second step
 */
// eslint-disable-next-line react/require-default-props
export default function ProjectCreationModal({ course }: { course?: Course }): JSX.Element {
  const [addProject] = useAddProjectMutation();
  const [addProjectAndCourse] = useAddProjectAndCourseMutation();
  const { data: courses } = useGetAllCoursesQuery();
  const { data: modules } = useGetAllModulesQuery();

  const [form] = Form.useForm();

  const onFinish = useCallback(
    async (data: {
      projectName?: string;
      projectKey?: string;
      courseName?: string;
      courseCode?: string;
      // Antd datepicker actually returns a moment object
      // Only year is used for now
      // Maybe we should consider adding moment to our dependencies?
      courseYear?: Dayjs;
      courseSem?: string;
    }) => {
      try {
        const { courseCode, courseYear, courseSem, courseName, projectKey, projectName } = data;
        if (!projectName) {
          throw new Error('Please provide a correct project name!');
        }

        if (courseCode && courseYear && courseSem) {
          // New project and course
          await addProjectAndCourse({
            projectName: projectName.trim(),
            projectKey: projectKey?.trim(),
            courseId: courseCode?.trim(),
            courseYear: Number(courseYear.year()),
            courseSem: Number(courseSem),
            courseName:
              courseName ??
              // Add in names if possible
              courses?.filter((c) => c.id === courseCode)[0]?.cname ??
              modules?.filter((m) => m.moduleCode === courseCode)[0]?.title,
          }).unwrap();
        } else if (course) {
          // New project and picked course
          await addProjectAndCourse({
            projectName: projectName.trim(),
            projectKey: projectKey?.trim(),
            courseId: course.id,
            courseYear: course.year,
            courseSem: course.sem,
            courseName: course.cname,
          }).unwrap();
        } else {
          // Independent project
          await addProject({ pname: projectName.trim(), pkey: projectKey?.trim() }).unwrap();
        }
        message.success(`Project ${projectName} has been created!`);
      } catch (err) {
        message.error(getErrorMessage(err));
      }
    },
    [addProject, addProjectAndCourse, course, courses, modules],
  );

  return (
    <MultistepFormModal
      title="Create Project"
      buttonName="Create Project"
      form={form}
      formSteps={course ? [<FormStep1 />] : [<FormStep1 />, <FormStep2 />]}
      onSubmit={onFinish}
    />
  );
}

function FormStep1(): JSX.Element {
  return (
    <>
      <p>You can change these details anytime in your project settings.</p>
      <ProjectNameFormInput />
      <ProjectKeyFormInput />
    </>
  );
}

function FormStep2(): JSX.Element {
  const segmentOptions = ['Independent', 'Choose from existing', 'Create new'];
  const { data: courses } = useGetAllCoursesQuery();
  const { data: modules } = useGetAllModulesQuery();
  const [type, setType] = useState<string>('Independent');

  const courseOptions = useMemo(() => {
    const results: Set<{ id: string; name: string }> = new Set();
    if (modules) {
      modules.forEach((m) => results.add({ id: m.moduleCode, name: m.title }));
    }
    if (courses) {
      courses.forEach((c) => results.add({ id: c.id, name: c.cname }));
    }
    return Array.from(results).map((x) => (
      <Option key={`${x.id} ${x.name}`} value={x.id}>
        {`${x.id} ${x.name}`}
      </Option>
    ));
  }, [courses, modules]);

  return (
    <>
      <p>You can attach this project to a course.</p>
      <Segmented
        options={segmentOptions}
        style={{ marginBottom: '10px' }}
        onChange={(t) => setType(t.toString())}
        onResize={() => {}}
        onResizeCapture={() => {}}
      />

      {type === 'Independent' && <Typography>This project will be an independent project.</Typography>}

      {type === 'Choose from existing' && (
        <>
          <SelectCourseCodeFormItem courseOptions={courseOptions} />
          <CourseYearSemFormItems />
        </>
      )}

      {type === 'Create new' && (
        <>
          <CourseCodeFormItem isRequired />
          <CourseNameFormItem />
          <CourseYearSemFormItems />
        </>
      )}
    </>
  );
}
