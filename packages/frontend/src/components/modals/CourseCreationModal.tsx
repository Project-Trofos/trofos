import React, { useCallback } from 'react';
import { Form, Input, Typography, message, DatePicker, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAddCourseMutation } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';
import { getErrorMessage } from '../../helpers/error';

const { Paragraph } = Typography;

/**
 * Modal for creating courses
 */
export default function CourseCreationModal() {
  const [addCourse] = useAddCourseMutation();

  const [form] = Form.useForm();

  const onFinish = useCallback(
    async (values: { courseCode: string; courseYear: string; courseSem: string; courseName: string }) => {
      try {
        await addCourse({
          id: values.courseCode.trim(),
          year: Number(values.courseYear),
          sem: Number(values.courseSem),
          cname: values.courseName.trim(),
        });
        message.success(`Course ${values.courseName} has been created!`);
      } catch (err) {
        message.error(getErrorMessage(err));
      }
    },
    [addCourse],
  );

  return (
    <MultistepFormModal
      title="Create Course"
      buttonName="Create Course"
      form={form}
      onSubmit={(data) => onFinish(data)}
      formSteps={[
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
              { max: 64, message: 'The code must be at most 64 characters long.' },
            ]}
            tooltip={{ title: 'This code will be used to index the course.', icon: <InfoCircleOutlined /> }}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Academic Year"
            name="courseYear"
            rules={[{ required: true, message: "Please input your course's year!" }]}
          >
            <DatePicker picker="year" format="YYYY" />
          </Form.Item>

          <Form.Item
            label="Semester"
            name="courseSem"
            rules={[{ required: true, message: "Please input your course's semester!" }]}
          >
            <Select placeholder="Select a semester">
              <Select.Option key="1">1</Select.Option>
              <Select.Option key="2">2</Select.Option>
            </Select>
          </Form.Item>
        </>,
      ]}
    />
  );
}
