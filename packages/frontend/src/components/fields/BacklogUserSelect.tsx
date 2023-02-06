import React from 'react';
import { Avatar, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { BacklogUserSelectTypes } from '../../helpers/BacklogModal.types';
import './BacklogUserSelect.css';

type BacklogUserSelectPropsTypes = {
  value?: string | number;
  onChange?(e: string | number | undefined): void;
  options: BacklogUserSelectTypes[];
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
      dropdownMatchSelectWidth={false}
    >
      {options.map((option) => (
        <Option key={option.user.user_id} value={option.user.user_id}>
          <Avatar className="user-select-avatar" style={{ backgroundColor: '#ccc' }} icon={<UserOutlined />} />
          <span className="user-select-username-text">{option.user.user_display_name}</span>
        </Option>
      ))}
    </Select>
  );
}

BacklogUserSelect.defaultProps = {
  className: '',
  allowClear: false,
  placeholder: '',
  value: undefined,
  onChange: undefined,
};

export default BacklogUserSelect;
