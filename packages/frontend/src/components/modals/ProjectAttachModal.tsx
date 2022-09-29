import React, { useCallback, useMemo } from 'react';
import { Form, message, Select } from 'antd';
import { Project } from '../../api/project';
import { useAddProjectToCourseMutation, useGetAllCoursesQuery } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';
import { getErrorMessage } from '../../helpers/error';

const { Option } = Select;

/**
 * Modal for creating projects
 */
export default function ProjectAttachModal({ project }: { project: Project }) {
  const [addProjectToCourse] = useAddProjectToCourseMutation();
  const { data: courses } = useGetAllCoursesQuery();

  const [form] = Form.useForm();

  const onFinish = useCallback(
    async (data: { courseCode?: string }) => {
      try {
        if (!courses) {
          throw new Error('Courses not loaded!');
        }

        const { courseCode } = data;
        const selectedCourse = courses.filter((c) => c.id === courseCode)[0];
        if (!courseCode) {
          throw new Error('Invalid data!');
        }
        await addProjectToCourse({
          courseId: courseCode,
          courseYear: selectedCourse.year,
          courseSem: selectedCourse.sem,
          projectId: project.id,
        }).unwrap();
      } catch (err) {
        message.error(getErrorMessage(err));
      }
    },
    [project.id, addProjectToCourse, courses],
  );

  return (
    <MultistepFormModal
      title="Attach to course"
      buttonName="Attach to course"
      form={form}
      formSteps={[<FormStep2 />]}
      onSubmit={onFinish}
    />
  );
}

function FormStep2(): JSX.Element {
  const { data: courses } = useGetAllCoursesQuery();

  const courseOptions = useMemo(() => {
    const results: JSX.Element[] = [];
    if (courses) {
      results.push(
        ...courses.map((c) => (
          <Option key={`${c.id} ${c.cname}`} value={c.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{c.id}</span>
              <span>{c.cname}</span>
            </div>
          </Option>
        )),
      );
    }
    return results;
  }, [courses]);

  return (
    <>
      <p>You can attach this project to a course.</p>

      <Form.Item label="Course" name="courseCode" rules={[{ required: true, message: 'Please select course!' }]}>
        <Select
          showSearch
          placeholder="Search to Select"
          optionFilterProp="children"
          filterOption={(input, option) => {
            if (!option) {
              return false;
            }
            return (option.key as string).toLowerCase().includes(input.toLowerCase());
          }}
        >
          {courseOptions}
        </Select>
      </Form.Item>
    </>
  );
}
