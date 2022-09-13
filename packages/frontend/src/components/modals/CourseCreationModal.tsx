import React from 'react';
import { Form, Input, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAddCourseMutation } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';


const { Paragraph } = Typography;

/**
 * Modal for creating courses
 */
export default function CourseCreationModal() {
  const [addCourse] = useAddCourseMutation();

  const [form] = Form.useForm();

  const onFinish = (values: { courseCode: string; courseName: string }) => {
    addCourse({ id: values.courseCode, cname: values.courseName });
  };

  return (
    <MultistepFormModal title='Create Course' buttonName='Create Course' form={form} onSubmit={(data) => onFinish(data)} formSteps={[
      <>
        <Paragraph>Please input the details for your course.</Paragraph>
        <Form.Item
          label="Name"
          name="courseName"
          required
          rules={[{ required: true, message: "Please input your course's name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Code"
          name="courseCode"
          rules={[
            { pattern: /^[a-zA-Z0-9-]*$/, message: 'The code must be alphanumeric.' },
            { max: 64, message: 'The code must be at most 64 characters long.'  },
          ]}
          tooltip={{ title: 'This code will be used to index the course.', icon: <InfoCircleOutlined /> }}
        >
          <Input />
        </Form.Item>
      </>,
    ]} />
  );
}