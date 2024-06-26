import React, { useCallback, useMemo } from 'react';
import { Form, message, Select } from 'antd';
import { Project } from '../../api/types';
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
    async (data: { courseCode?: number }) => {
      try {
        if (!courses) {
          throw new Error('Courses not loaded!');
        }

        const { courseCode } = data;
        if (!courseCode) {
          throw new Error('Invalid data!');
        }
        await addProjectToCourse({
          courseId: courseCode,
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
      buttonChildren="Attach to course"
      form={form}
      formSteps={[<FormStep />]}
      onSubmit={onFinish}
      buttonElement="span"
    />
  );
}

function FormStep(): JSX.Element {
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
