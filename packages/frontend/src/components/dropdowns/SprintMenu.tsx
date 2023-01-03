import React, { useState } from 'react';
import { Dropdown, Menu, message, Modal, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useDeleteSprintMutation } from '../../api/sprint';

function SprintMenu(props: {
  sprintId: number;
  handleSprintOnClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}): JSX.Element {
  const { sprintId, handleSprintOnClick } = props;
  const [deleteSprint] = useDeleteSprintMutation();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteSprint = async () => {
    try {
      await deleteSprint(sprintId).unwrap();
      message.success('Sprint deleted');
    } catch (e) {
      message.error('Failed to delete sprint');
      console.error(e);
    }
  };

  const openDeleteConfirmationModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmationModal = () => {
    setIsDeleteModalOpen(false);
  };

  const menuItems = (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <div onClick={handleSprintOnClick}>Edit sprint</div>
          ),
        },
        {
          key: '2',
          danger: true,
          label: (
            <div onClick={openDeleteConfirmationModal}>Delete sprint</div>
          ),
        },
      ]}
    />
  );

  return (
    <>
      <Dropdown className="sprint-menu-dropdown" overlay={menuItems} trigger={['click']} placement="bottomRight">
        <Space>
          <SettingOutlined style={{ fontSize: '18px' }} />
        </Space>
      </Dropdown>
      <Modal
        title="DELETE SPRINT"
        visible={isDeleteModalOpen}
        onOk={handleDeleteSprint}
        onCancel={closeDeleteConfirmationModal}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        closable={false}
      >
        <p>Are you sure you want to delete this sprint?</p>
        <p>Once this action is done, the sprint will be permenantly removed.</p>
        <p>Backlogs in this sprint will automatically be unassigned.</p>
      </Modal>
    </>
  );
}

export default SprintMenu;
