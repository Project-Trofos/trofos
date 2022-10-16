import React, { useState } from 'react'
import { Table } from 'antd';
import { User } from '../../api/types';
import UserManagementModal from '../modals/UserManagementModal';


export default function UserTable({ users } :{ users: User[] | undefined}) : JSX.Element {


    return (
        <Table
            dataSource={users}
            rowKey={(user) => user.user_id}
            bordered
            pagination={{pageSize: 10}}
        >
            <Table.Column width={300} title="User ID" dataIndex="user_id"/>
            <Table.Column width={300} title="Email" dataIndex="user_email"/>
            <Table.Column 
                title="Actions"
                dataIndex="action"
                render={(_, record: User) => (
                    <UserManagementModal />
                )}
            />
        </Table>

    )
}