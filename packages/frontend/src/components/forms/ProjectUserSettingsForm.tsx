import React from 'react';
import { message, Switch } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation } from '../../api/project';
import './ProjectUserSettingsForm.css';

export default function ProjectUserSettingsForm(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: projectUserSettings } = useGetUserSettingsQuery({ id: projectId });
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
      <span className="settings-label">Email notification: </span>
      <Switch checked={projectUserSettings?.email_notification} onChange={handleEmailNotificationOnChange} />
    </div>
  );
}
