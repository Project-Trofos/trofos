import { Button, Form, Input, message, Space } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../api/hooks';
import { useUpdateProjectMutation } from '../api/project';
import ProjectKeyFormInput from '../components/forms/ProjectKeyFormItem';
import ProjectNameFormInput from '../components/forms/ProjectNameFormItem';
import { Subheading } from '../components/typography';
import { getErrorMessage } from '../helpers/error';

export default function Overview(): JSX.Element {
  const params = useParams();
  const { project } = useProject(params.projectId);

  const [updateProject] = useUpdateProjectMutation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFinish = async (values: { projectName?: string; projectDescription?: string }) => {
    try {
      if (!project) {
        throw Error('Project is undefined!');
      }
      setIsUpdating(true);
      await updateProject({ id: project.id, description: values.projectDescription, pname: values.projectName });
      message.success('Project updated!');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
    setIsUpdating(false);
  };

  return (
    <Space direction="vertical" style={{ padding: 20, width: '100%' }}>
      <Subheading>Project details</Subheading>
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 12 }}
        initialValues={{
          projectName: project?.pname,
          projectKey: project?.pkey,
          projectDescription: project?.description,
        }}
        onFinish={handleFinish}
      >
        <ProjectNameFormInput />
        <ProjectKeyFormInput />

        <Form.Item label="Description" name="projectDescription">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6 }}>
          <Button type="primary" htmlType="submit" loading={isUpdating}>
            Update
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
}
