import React from 'react';
import { message, Switch, Typography, Row, Col } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateUserSettingsMutation } from '../../api/project';
import { ProjectUserSettings } from '../../api/types';

export default function ProjectUserSettingsForm(props: { projectUserSettings: ProjectUserSettings }): JSX.Element {
  const { projectUserSettings } = props;

  const params = useParams();
  const projectId = Number(params.projectId);
  const [updateProjectSettings] = useUpdateUserSettingsMutation();

  const handleEmailNotificationOnChange = async (checked: boolean) => {
    if (checked === projectUserSettings?.email_notification) return;

    try {
      await updateProjectSettings({ projectId, updatedSettings: { email_notification: checked } }).unwrap();
      message.success('Updated settings');
    } catch (error) {
      message.error('Failed to update settings');
      console.log(error);
    }
  };

  return (
    <div className="project-user-settings-container">
      <Row gutter={4}>
        <Col>
          <Typography>Email Notification:</Typography>
        </Col>
        <Col>
          <Switch checked={projectUserSettings?.email_notification} onChange={handleEmailNotificationOnChange} />
        </Col>
      </Row>
    </div>
  );
}
