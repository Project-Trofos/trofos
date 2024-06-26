import React, { useState } from 'react';
import { Dropdown, message, Modal, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDeleteBacklogMutation } from '../../api/socket/backlogHooks';
import './BacklogMenu.css';

function BacklogMenu(props: { projectId: number; backlogId: number }): JSX.Element {
  const { projectId, backlogId } = props;
  const [deleteBacklog] = useDeleteBacklogMutation();
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteBacklog = async () => {
    try {
      await deleteBacklog({ projectId, backlogId }).unwrap();
      message.success('Backlog deleted');
      navigate(`/project/${projectId}/sprint`);
    } catch (e) {
      message.error('Failed to delete backlog');
      console.error(e);
    }
  };

  const openDeleteConfirmationModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmationModal = () => {
    setIsDeleteModalOpen(false);
  };

  const menuItems = {
    items: [
      {
        key: '1',
        danger: true,
        label: <div onClick={openDeleteConfirmationModal}>Delete backlog</div>,
      },
    ],
  };

  return (
    <>
      <Dropdown className="backlog-menu-dropdown" menu={menuItems} trigger={['click']} placement="bottomRight">
        <Space>
          <SettingOutlined style={{ fontSize: '18px' }} />
        </Space>
      </Dropdown>
      <Modal
        title="DELETE BACKLOG"
        open={isDeleteModalOpen}
        onOk={handleDeleteBacklog}
        onCancel={closeDeleteConfirmationModal}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        closable={false}
      >
        <p>Are you sure you want to delete this backlog?</p>
        <br />
        <p>Once this action is done, the backlog will be permenantly removed</p>
      </Modal>
    </>
  );
}

export default BacklogMenu;
