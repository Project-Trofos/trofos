import React from 'react';
import { Form, Input } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAddProjectMutation } from '../../api/project';
import { useAddProjectAndCourseMutation } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';


/**
 * Modal for creating projects
 */
export default function ProjectCreationModal() {

  const [addProject] = useAddProjectMutation();
  const [addProjectAndCourse] = useAddProjectAndCourseMutation();

  const [form] = Form.useForm();

  const onFinish = (data: { projectName?: string; projectKey?: string; courseName?: string; courseCode?: string }) => {
    const { courseCode, courseName, projectKey, projectName } = data;
    if (courseCode && courseName && projectName) {
      addProjectAndCourse({ 
        projectName,
        projectKey,
        courseId: courseCode,
        courseName,
      });
    } else if (projectName) {
      addProject({ pname: projectName, pkey: projectKey });
    } else {
      throw new Error('Invalid data!');
    }
  };

  return (
    <MultistepFormModal buttonName='Create Project' form={form} formSteps={[FormStep1(), FormStep2()]} onSubmit={onFinish} />
  );
}

function FormStep1(): JSX.Element {
  return (
    <>
      <p>You can change these details anytime in your project settings.</p>
      <Form.Item
        label="Name"
        name="projectName"
        required
        rules={[{ required: true, message: "Please input your project's name!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Key"
        name="projectKey"
        rules={[
          { pattern: /^[a-zA-Z0-9-]*$/, message: 'The key must be alphanumeric.' },
          { max: 64, message: 'The key must be at most 64 characters long.' },
        ]}
        tooltip={{ title: 'This key will be used as a prefix to the issues.', icon: <InfoCircleOutlined /> }}
      >
        <Input />
      </Form.Item>
    </>
  );
}

function FormStep2(): JSX.Element {
  return (
    <>
      <p>You can attach this project to a course.</p>

      <Form.Item
        label="Course Name"
        name="courseName"
        rules={[
          { pattern: /^[a-zA-Z0-9-]*$/, message: 'The course name must be alphanumeric.' },
          { max: 64, message: 'The key must be at most 64 characters long.' },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Course Code"
        name="courseCode"
        required
        rules={[{ required: true, message: "Please input your course's code!" }]}
        tooltip={{ title: 'Course code will be used to uniquely identify this course.', icon: <InfoCircleOutlined /> }}
      >
        <Input />
      </Form.Item>
    </>
  );
}
