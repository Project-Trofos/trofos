import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useParams } from 'react-router-dom';
import {
  useAddGitUrlMutation,
  useDeleteGitUrlMutation,
  useGetGitUrlQuery,
  useUpdateGitUrlMutation,
} from '../../api/project';
import DefaultForm from './DefaultForm';
import './ProjectGitLinkForm.css';

export default function ProjectGitLinkForm(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);

  const [isAddingLink, setIsAddingLink] = useState(false);

  const { data: currentGitUrl } = useGetGitUrlQuery({ id: projectId });
  const [addGitUrl] = useAddGitUrlMutation();
  const [updateGitUrl] = useUpdateGitUrlMutation();
  const [deleteGitUrl] = useDeleteGitUrlMutation();

  const isValidGithubUrl = (url: string) => {
    const regex = /https:\/\/github.com\/[-a-zA-Z0-9()@:%_+.~#?&\/\/=]*\/[-a-zA-Z0-9()@:%_+.~#?&\/\/=]*\.git$/;

    return regex.test(url);
  };

  const handleFormSubmit = async (formData: { gitLinkUrl?: string }) => {
    try {
      if (formData.gitLinkUrl && !isValidGithubUrl(formData.gitLinkUrl)) {
        message.error('Invalid GitHub URL. Please ensure that the URL is the same as the HTTPS cloning URL');
        return;
      }

      if (currentGitUrl && formData.gitLinkUrl) {
        await updateGitUrl({
          projectId,
          repoLink: formData.gitLinkUrl,
        }).unwrap();
      } else if (formData.gitLinkUrl) {
        await addGitUrl({
          projectId,
          repoLink: formData.gitLinkUrl,
        }).unwrap();
      } else {
        await deleteGitUrl({ id: projectId }).unwrap();
      }
      message.success('Github link updated');
      setIsAddingLink(false);
    } catch (err) {
      console.error(err);
      message.error('Unable to add link Github');
    }
  };

  return (
    <div className="git-link-form">
      {currentGitUrl || isAddingLink ? (
        <Form
          initialValues={{ gitLinkUrl: currentGitUrl?.repo }}
          onFinish={handleFormSubmit as (values: unknown) => void}
        >
          <Form.Item name="gitLinkUrl">
            <Input placeholder="Enter Github Repository URL (e.g https://github.com/Project-Trofos/trofos.git)..." />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
          {!currentGitUrl && (
            <Button
              onClick={() => {
                setIsAddingLink(false);
              }}
            >
              Cancel
            </Button>
          )}
        </Form>
      ) : (
        <Button
          onClick={() => {
            setIsAddingLink(true);
          }}
        >
          Connect Github
        </Button>
      )}
    </div>
  );
}
