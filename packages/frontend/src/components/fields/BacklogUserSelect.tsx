import React from 'react';
import { Avatar, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { BacklogSelectTypes } from '../../helpers/BacklogModal.types';
import './BacklogUserSelect.css';

type BacklogUserSelectPropsTypes = {
  value: string;
  onChange(e: any): void;
  options: BacklogSelectTypes[];
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
};

const { Option } = Select;

function BacklogUserSelect(props: BacklogUserSelectPropsTypes): JSX.Element {
  const { value, onChange, options, placeholder, className, allowClear } = props;

  return (
    <Select
      value={value}
      onChange={onChange}
      className={`backlog-user-select ${className}`}
      placeholder={placeholder}
      allowClear={allowClear}
    >
      {options.map((option) => (
        <Option key={option.id} value={option.id}>
          <Avatar className="user-select-avatar" style={{ backgroundColor: '#ccc' }} icon={<UserOutlined />} />
          <span className="user-select-username-text">{option.name}</span>
        </Option>
      ))}
    </Select>
  );
}

BacklogUserSelect.defaultProps = {
  className: '',
  allowClear: false,
  placeholder: '',
};

export default BacklogUserSelect;
