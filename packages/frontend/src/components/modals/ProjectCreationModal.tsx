import React, { useCallback, useState } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAddProjectMutation } from '../../api/project';
import { useAddProjectAndCourseMutation } from '../../api/course';


/**
 * Modal for creating projects
 */
export default function ProjectCreationModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState<{ projectName?: string; projectKey?: string; cid?: string; cname?: string; }>({});
  const [step, setStep] = useState<number>(1);

  const [addProject] = useAddProjectMutation();
  const [addProjectAndCourse] = useAddProjectAndCourseMutation();


  const [form] = Form.useForm();

  const showModal = () => {
    setStep(1);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setStep(1);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = () => {
    const partialData = form.getFieldsValue();
    console.log(partialData, data);
    if (partialData.courseCode && partialData.courseName && data.projectName) {
      addProjectAndCourse({ 
        projectName: data.projectName,
        projectKey: data.projectKey,
        courseId: partialData.courseCode,
        courseName: partialData.courseName,
      });
    } else if (data.projectName) {
      addProject({ pname: data.projectName, pkey: data.projectKey });
    } else {
      throw new Error('Invalid data!');
    }
    handleOk();
  };

  const onNext = () => {
    form.validateFields().then(() => {
      const partialData = form.getFieldsValue();
      setData(d => ({ ...d, ...partialData }));
      setStep(i => i + 1);
    });
  };

  return (
    <>
      <Button onClick={showModal} type="primary">
        Create Project
      </Button>
      <Modal
        title="Create Project"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        getContainer={false}
        footer={step === 1 ? [
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="next" type="primary" onClick={onNext}>
            Next
          </Button>,
        ] : [
          <Button key="prev" type="primary" onClick={() => setStep(step - 1)}>
            Back
          </Button>,
          <Button type="primary" form="project-creation-form" key="submit" htmlType="submit">
            Create
          </Button>,
        ]}
      >
        <Form
          name="project-creation-form"
          layout="vertical"
          form={form}
          wrapperCol={{ span: 20 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          {step === 1 ? <FormStep1/> : <FormStep2/>}
        </Form>
      </Modal>
    </>
  );
}

function FormStep1(): JSX.Element {
  return (
    <div>
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
    </div>
  );
}

function FormStep2(): JSX.Element {
  return (
    <div>
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
    </div>
  );
}

