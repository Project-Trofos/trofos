import React from 'react';
import {
  CheckSquareOutlined,
  BugOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Space } from 'antd';

/* eslint-disable import/prefer-default-export */
const UserPermissionActions = {
  READ_COURSE: 'read_course',
  CREATE_COURSE: 'create_course',
  UPDATE_COURSE: 'update_course',
  CREATE_PROJECT: 'create_project',
  READ_PROJECT: 'read_project',
  UPDATE_PROJECT: 'update_project',
  UPDATE_PROJECT_USERS: 'update_project_users',
  ADMIN: 'admin',
  READ_API_KEY: 'read_api_key',
  SEND_INVITE: 'send_invite',
} as const;

type UserPermissionActionsType = (typeof UserPermissionActions)[keyof typeof UserPermissionActions];

const COURSE_MANAGER_ACTIONS: UserPermissionActionsType[] = [
  UserPermissionActions.ADMIN,
  UserPermissionActions.UPDATE_COURSE,
];

const MANAGE_API_KEY_ACTIONS: UserPermissionActionsType[] = [
  // if read AND write given to faculty. just check read
  UserPermissionActions.ADMIN,
  UserPermissionActions.READ_API_KEY,
];

const BACKLOG_PRIORITY_OPTIONS = [
  { value: 'very_high', label: 'Very High' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'very_low', label: 'Very Low' },
];

const BACKLOG_TYPE_OPTIONS = [
  {
    value: 'story',
    label: (
      <Space>
        <WalletOutlined />
        Story
      </Space>
    ),
    icon: <WalletOutlined />
  },
  {
    value: 'task',
    label: (
      <Space>
        <CheckSquareOutlined />
        Task
      </Space>
    ),
    icon: <CheckSquareOutlined /> },
  { 
    value: 'bug',
    label: (
      <Space>
        <BugOutlined />
        Bug
      </Space>
    ),
    icon: <BugOutlined /> },
];

export {
  UserPermissionActions,
  COURSE_MANAGER_ACTIONS,
  BACKLOG_PRIORITY_OPTIONS,
  MANAGE_API_KEY_ACTIONS,
  BACKLOG_TYPE_OPTIONS,
};
