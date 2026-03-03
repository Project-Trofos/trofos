import React, { useState } from 'react';
import { Row, Col, Divider, Input, Select, Space } from 'antd';
import AdminUserTable from '../tables/AdminUserTable';
import { useGetUsersQuery } from '../../api/user';
import AddUserModal from '../modals/AddUserModal';
import { useGetRolesQuery } from '../../api/role';

/**
 * User mangement tab for admin
 */
export default function UserManagement(): JSX.Element {
  const [searchText, setSearchText] = useState('');
  const [inactivityFilter, setInactivityFilter] = useState('any');

  const { data: getUsers } = useGetUsersQuery();
  const { data: getRoles } = useGetRolesQuery();

  const filteredUsers = getUsers?.filter((user: any) => {
    const search = searchText.toLowerCase();
    const email = user.userEmail || user.user_email;
    const name = user.userDisplayName || user.user_display_name;
    const id = user.userId || user.user_id;

    const matchesSearch = (
      email?.toLowerCase().includes(search) ||
      name?.toLowerCase().includes(search) ||
      id?.toString().includes(search)
    );

    if (!matchesSearch) return false;

    if (inactivityFilter === 'any') return true;
    
    const lastAccess = user.api_usages?.[0]?.timestamp;
    if (inactivityFilter === 'never') return !lastAccess;

    if (!lastAccess) {
      if (inactivityFilter.startsWith('inactive')) return true;
      if (inactivityFilter.startsWith('recent')) return false;
    }

    const accessDate = new Date(lastAccess);
    const cutoffDate = new Date();

    switch (inactivityFilter) {
      // Inactivity Checks
      case 'inactive_3':
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        return accessDate < cutoffDate;
      case 'inactive_6':
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        return accessDate < cutoffDate;
      case 'inactive_12':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        return accessDate < cutoffDate;
        
      // Recent Activity Checks
      case 'recent_1':
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        return accessDate >= cutoffDate;
      case 'recent_7':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        return accessDate >= cutoffDate;
      case 'recent_30':
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        return accessDate >= cutoffDate;
      default:
        return true;
    }
  });

  // Dropdown options
  const filterDateOptions = [
    { value: 'any', label: 'Any Time' },
    {
      label: 'Inactivity',
      options: [
        { value: 'inactive_3', label: 'Inactive > 3 Months' },
        { value: 'inactive_6', label: 'Inactive > 6 Months' },
        { value: 'inactive_12', label: 'Inactive > 1 Year' },
        { value: 'never', label: 'Never Logged In' },
      ],
    },
    {
      label: 'Recent Activity',
      options: [
        { value: 'recent_1', label: 'Last 24 Hours' },
        { value: 'recent_7', label: 'Last 7 Days' },
        { value: 'recent_30', label: 'Last 30 Days' },
      ],
    },
  ];

  return (
    <Row>
      <Col offset={4} span={16}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <AddUserModal />
          <div style={{ display: 'flex', gap: '12px', width: '60%' }}>
            <Input
              placeholder='Search User by ID, Name, Email'
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '65%' }}
            />

            <Select
              defaultValue='any'
              onChange={(value) => setInactivityFilter(value)}
              options={filterDateOptions}
              style={{ width: '35%' }}
            />
          </div>
        </div>
        <Divider />
        <AdminUserTable users={filteredUsers} roles={getRoles} />
      </Col>
    </Row>
  );
}
