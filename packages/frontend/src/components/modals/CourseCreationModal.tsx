import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAddCourseMutation } from '../../api/course';


/**
 * Modal for creating courses
 */
export default function CourseCreationModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addCourse] = useAddCourseMutation();

  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = (values: { courseCode: string; courseName: string }) => {
    addCourse({ id: values.courseCode, cname: values.courseName });
    handleOk();
  };

  return (
    <>
      <Button onClick={showModal} type="primary">
        Create Course
      </Button>
      <Modal
        title="Create Course"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        getContainer={false}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button type="primary" form="course-creation-form" key="submit" htmlType="submit">
            Create
          </Button>,
        ]}
      >
        <p>You can change these details anytime in your course settings.</p>
        <Form
          name="course-creation-form"
          form={form}
          layout="vertical"
          wrapperCol={{ span: 20 }}
          onFinish={onFinish}
          autoComplete="off"
        >
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
        </Form>
      </Modal>
    </>
  );
}
