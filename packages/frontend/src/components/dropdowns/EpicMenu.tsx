import { SettingOutlined } from "@ant-design/icons";
import { Dropdown, Modal, Space, message } from "antd";
import { useDeleteEpicMutation } from "../../api/socket/backlogHooks";
import { useState } from "react";


function EpicMenu(props: {
    epicId: number;
    projectId: number;
  }): JSX.Element {
    const { epicId, projectId } = props;
    const [deleteEpic] = useDeleteEpicMutation();
  
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
    const handleDeleteEpic = async () => {
      try {
        await deleteEpic({ epicId, projectId }).unwrap();
        message.success('Epic deleted');
      } catch (e) {
        message.error('Failed to delete epic');
        console.error(e);
      }
    };
  
    const openDeleteConfirmationModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
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
          label: <div onClick={openDeleteConfirmationModal}>Delete epic</div>,
        },
      ],
    };
  
    return (
      <>
        <Dropdown className="epic-menu-dropdown" menu={menuItems} trigger={['click']} placement="bottomRight">
          <Space>
            <SettingOutlined style={{ fontSize: '18px' }} />
          </Space>
        </Dropdown>
        <Modal
          title="DELETE SPRINT"
          open={isDeleteModalOpen}
          onOk={handleDeleteEpic}
          onCancel={closeDeleteConfirmationModal}
          okText="Delete"
          okType="danger"
          cancelText="Cancel"
          closable={false}
        >
          <p>Are you sure you want to delete this epic?</p>
          <p>Once this action is done, the epic will be permenantly removed.</p>
          <p>Backlogs in this epic will automatically be unassigned.</p>
        </Modal>
      </>
    );
  }
  
  export default EpicMenu;