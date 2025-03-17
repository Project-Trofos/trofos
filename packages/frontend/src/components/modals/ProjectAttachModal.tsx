import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

  const [form] = Form.useForm();

  const onFinish = useCallback(
    async (data: { courseCode?: number }) => {
      try {
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
    [project.id, addProjectToCourse],
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
  const [searchNameParam, setSearchNameParam] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchNameParam);
  const { data: courses } = useGetAllCoursesQuery({
    keyword: debouncedSearch,
  });

  // Debounce the search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchNameParam);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchNameParam]);

  const courseOptions = useMemo(() => {
    const results: JSX.Element[] = [];
    if (courses) {
      results.push(
        ...courses.data.map((c) => (
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
          value={searchNameParam}
          onChange={(value) => setSearchNameParam(value as string)}
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
