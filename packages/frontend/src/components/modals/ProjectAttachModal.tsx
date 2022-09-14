import React, { useMemo } from 'react';
import { Form, Select } from 'antd';
import { Project } from '../../api/project';
import { useAddProjectToCourseMutation, useGetAllCoursesQuery } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';

const { Option } = Select;


/**
 * Modal for creating projects
 */
export default function ProjectAttachModal({ project } : { project: Project }) {

  const [addProjectToCourse] = useAddProjectToCourseMutation();

  const [form] = Form.useForm();

  const onFinish = (data: { courseCode?: string }) => {
    const { courseCode } = data;
    if (!courseCode) {
      throw new Error('Invalid data!');
    }
    
    addProjectToCourse({ courseId: courseCode, projectId: project.id });
  };

  return (
    <MultistepFormModal 
      title='Attach to course'
      buttonName='Attach to course'
      form={form} formSteps={[<FormStep2 />]}
      onSubmit={onFinish}
    />
  );
}

function FormStep2(): JSX.Element {
  const { data: courses } = useGetAllCoursesQuery();

  const courseOptions = useMemo(() => {
    const results: JSX.Element[] = [];
    if (courses) {
      results.push(...courses.map(c => 
        <Option key={`${c.id} ${c.cname}`} value={c.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{c.id}</span>
            <span>{c.cname}</span>
          </div>
        </Option>,
      ));
    }
    return results;
  }, [courses]);

  return (
    <>
      <p>You can attach this project to a course.</p>

      <Form.Item
        label="Course"
        name="courseCode"
        rules={[{ required: true, message: 'Please select course!' }]}
      >
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
