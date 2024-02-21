import React, { useState } from 'react';
import { Form, Input, message, Space, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { useProject } from '../../api/hooks';
import { useGetUserSettingsQuery, useUpdateProjectMutation } from '../../api/project';
import DefaultForm from '../../components/forms/DefaultForm';
import ProjectKeyFormInput from '../../components/forms/ProjectKeyFormItem';
import ProjectNameFormInput from '../../components/forms/ProjectNameFormItem';
import Container from '../../components/layouts/Container';
import { Subheading } from '../../components/typography';
import { getErrorMessage } from '../../helpers/error';
import ProjectBacklogStatusForm from '../../components/forms/ProjectBacklogStatusForm';
import ProjectGitLinkForm from '../../components/forms/ProjectGitLinkForm';
import ProjectUserSettingsForm from '../../components/forms/ProjectUserSettingsForm';
import ProjectTelegramForm from '../../components/forms/ProjectTelegramForm';

export default function ProjectSettings(): JSX.Element {
  const params = useParams();
  const { data: projectUserSettings } = useGetUserSettingsQuery({ id: Number(params.projectId) });
  const { project } = useProject(Number(params.projectId) ? Number(params.projectId) : -1);

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
      <Space direction="vertical" style={{ width: '100%' }}>
        <Subheading>Backlog Statuses</Subheading>
        <ProjectBacklogStatusForm statuses={project?.backlogStatuses || []} />
      </Space>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Subheading>GitHub Linkage</Subheading>
        <ProjectGitLinkForm />
      </Space>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Subheading>Telegram Channel</Subheading>
        <ProjectTelegramForm />
      </Space>
      {projectUserSettings && (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Subheading>User Settings:</Subheading>
          <ProjectUserSettingsForm projectUserSettings={projectUserSettings} />
        </Space>
      )}
    </Container>
  );
}
