import React, { useState } from 'react';
import { Modal, Button, List, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { User } from '../../api/types';

type UserProjects = {
  user: User;
  trigger?: React.ReactNode;
};

export default function UserProjectsModal({ user, trigger }: UserProjects): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => setIsModalOpen(true);
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      {trigger ? (
        <span onClick={showModal} style={{ cursor: 'pointer' }}>
          {trigger}
        </span>
      ) : (
        <Button type="text" icon={<EyeOutlined />} onClick={showModal} title="View Assigned Projects"/>
      )}
      <Modal title={`Assigned Projects`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        {user.projects && user.projects.length > 0 ? (
          <List
            dataSource={user.projects}
            renderItem={(item: any) => (
              <List.Item>
                <Typography.Text>
                  {item.project?.pname || `Project ID: ${item.project_id}`}
                </Typography.Text>
              </List.Item>
            )}
          />
        ) : (
          <p>This user is not assigned to any projects.</p>
        )}
      </Modal>
    </>
  );
}