import React, { useState } from 'react';
import { Button, Modal, Select } from 'antd';
import {ActionsOnRoles} from '../../api/types'

type UserRoleManagement = {
    userRoleId : number | undefined;
    userRoleName : string | undefined;
    userEmail : string | undefined;
    roles : ActionsOnRoles[] | undefined;
    handleRoleChange : (userEmail : string, roleId: number) => void;
}

export default function UserTableRoleManagementModal(props : UserRoleManagement) : JSX.Element {

    const { userRoleId, userRoleName, userEmail, roles, handleRoleChange } = props;

    const [currentRole, setCurrentRole] = useState(userRoleId);

    const { Option } = Select;

    const handleSelectionChange = (value : string) => {
        setCurrentRole(Number(value));
    }

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
      };
    
      const handleOk = async () => {

        if (!userEmail || !currentRole) {
            return;
        }

         await handleRoleChange(userEmail, currentRole)

        setIsModalOpen(false);
      };
    
      const handleCancel = () => {
        setIsModalOpen(false);
      };

      return (
          <>
            <Button onClick={showModal}>{userRoleName}</Button>
            <Modal title="Modify User's Role" visible={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Select 
                    defaultValue={userRoleName} 
                    onChange={handleSelectionChange}
                >
                    {roles?.map(role => 
                    <Option key={role.id} value={role.id}>
                        <span>{role.role_name}</span>
                    </Option>)}
                </Select>
            </Modal>
          </>
      )
}