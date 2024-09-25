import { MenuProps, message } from 'antd';
import { useDeleteStandUpMutation } from '../../../api/socket/standUpHooks';
import { StandUpHeader } from '../../../api/standup';
import { confirmDeleteStandUp } from '../../modals/confirm';
import { getErrorMessage } from '../../../helpers/error';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

export default function useStandUpCardMenu(
  standUp: StandUpHeader,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
): { menu: MenuProps } {
  const [deleteStandUp] = useDeleteStandUpMutation();

  const handleOnDelete = async () => {
    try {
      confirmDeleteStandUp(async () => {
        await deleteStandUp(standUp).unwrap();
        message.success('Stand Up deleted!');
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'edit') {
      setIsModalOpen(true);
    }
    if (e.key === 'delete') {
      handleOnDelete();
    }
  };

  const items: MenuProps['items'] = [
    {
      label: 'edit',
      key: 'edit',
      icon: <EditOutlined />,
    },
    {
      label: 'delete',
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];
  const menu = { items, onClick: handleMenuClick };

  return { menu };
}
