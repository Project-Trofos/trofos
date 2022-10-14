import React, { useState } from 'react';
import { Form, Input, message, Space } from 'antd';
import { useParams } from 'react-router-dom';
import { useProject } from '../api/hooks';
import { useUpdateProjectMutation } from '../api/project';
import DefaultForm from '../components/forms/DefaultForm';
import ProjectKeyFormInput from '../components/forms/ProjectKeyFormItem';
import ProjectNameFormInput from '../components/forms/ProjectNameFormItem';
import Container from '../components/layouts/Container';
import { Subheading } from '../components/typography';
import { getErrorMessage } from '../helpers/error';

export default function ProjectSettings(): JSX.Element {
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
      await updateProject({
        id: project.id,
        description: values.projectDescription,
        pname: values.projectName,
      }).unwrap();
      message.success('Project updated!');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
    setIsUpdating(false);
  };

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Subheading>Project details</Subheading>
        <DefaultForm
          initialValues={{
            projectName: project?.pname,
            projectKey: project?.pkey,
            projectDescription: project?.description,
          }}
          onFinish={handleFinish as (values: unknown) => void}
          isUpdating={isUpdating}
        >
          <ProjectNameFormInput />
          <ProjectKeyFormInput isDisabled />

          <Form.Item label="Description" name="projectDescription">
            <Input.TextArea rows={4} />
          </Form.Item>
        </DefaultForm>
      </Space>
    </Container>
  );
}
