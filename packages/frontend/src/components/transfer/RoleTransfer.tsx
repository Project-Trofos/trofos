/* eslint-disable object-shorthand */
import React, { useState, useEffect } from "react";
import { Transfer } from "antd"
import type { TransferDirection } from 'antd/es/transfer';
import { ActionsOnRoles } from "../../api/types";
import { useAddActionToRoleMutation, useRemoveActionFromRoleMutation } from "../../api/role"

type RoleTransferProps = {
    actionsOnRoles : ActionsOnRoles[] | undefined,
    actions: string[] | undefined,
    activeRole: number
}

interface RecordType {
    key: string;
    title: string;
    description: string;
    chosen: boolean;
  }


export default function RoleTransfer({ actionsOnRoles, actions, activeRole} : RoleTransferProps) : JSX.Element {

    const [addActionToRole] = useAddActionToRoleMutation();
    const [removeActionFromRole] = useRemoveActionFromRoleMutation();

    const [selectedKeys, setSelectedKeys] = useState<RecordType[]>([]);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);

    const handleChange = async (
        newTargetKeys: string[],
        direction: TransferDirection,
        moveKeys: string[],
      ) => {
        if (moveKeys.length > 0) {
            // TransferDirection is either left or right
            if (direction === 'right') {
                // Moving to the right represents removing a premission
                for (const action of moveKeys) {
                    removeActionFromRole({ id : activeRole, action: action})
                }
            } else {
                // Moving to the left represents adding a permission
                for (const action of moveKeys) {
                    addActionToRole({ id : activeRole, action: action})
                }
            }
        }
        setTargetKeys(newTargetKeys);
      };

    useEffect(() => {
        const updateTransferSelection = () => {
            if (actionsOnRoles && actions && activeRole > 0) {
                const roleMapping = actionsOnRoles.filter(role => role.id === activeRole)[0];
                const roleActions = roleMapping?.actions.map(action => action.action);
                const disallowedActions = actions?.filter(action => !roleActions?.includes(action));
    
                const allowedActions : RecordType[] = [];
    
                for (const action of actions) {
                    const allowedAction = {
                        key: action,
                        title: action,
                        description: action,
                        chosen: true
                    }
                    allowedActions.push(allowedAction)
                }
    
                setSelectedKeys(allowedActions);
                setTargetKeys(disallowedActions);
            } else {
                setSelectedKeys([]);
                setTargetKeys([]);
            }
        }

        updateTransferSelection()
    }, [activeRole, actions, actionsOnRoles]);

    return (
        <Transfer
        dataSource={selectedKeys}
        showSearch
        listStyle={{
          width: 250,
          height: 300,
        }}
        operations={['remove action', 'add action']}
        targetKeys={targetKeys}
        onChange={handleChange}
        render={item => item.title}
      />
    )
}