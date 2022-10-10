import React from 'react';
import { Select } from 'antd';
import type { BacklogSelectTypes } from '../../helpers/BacklogModal.types';
import './BacklogSelect.css';

type BacklogSelectPropsTypes = {
  value?: string | number;
  onChange?(e: number | string | undefined): void;
  options: BacklogSelectTypes[];
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
};

const { Option } = Select;

function BacklogSelect(props: BacklogSelectPropsTypes): JSX.Element {
  const { value, onChange, options, placeholder, className, allowClear } = props;

  return (
    <Select
      value={value}
      onChange={onChange}
      className={`backlog-select ${className}`}
      placeholder={placeholder}
      allowClear={allowClear}
    >
      {options.map((option) => (
        <Option key={option.id} value={option.id}>
          {option.name}
        </Option>
      ))}
    </Select>
  );
}

BacklogSelect.defaultProps = {
  className: '',
  allowClear: false,
  value: undefined,
  onChange: undefined,
  placeholder: '',
};

export default BacklogSelect;