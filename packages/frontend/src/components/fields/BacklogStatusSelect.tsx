import React from 'react';
import { Select } from 'antd';
import './BacklogStatusSelect.css';

type BacklogStatusSelectPropsTypes = {
  value?: string | number;
  onChange?(e: number | string | undefined): void;
  className?: string;
  status: { name: string; type: 'todo' | 'in_progress' | 'done' }[];
};

const { Option } = Select;

function BacklogStatusSelect(props: BacklogStatusSelectPropsTypes): JSX.Element {
  const { value, onChange, className, status } = props;

  const selectStatusType = status.filter((s) => s.name === value)?.[0]?.type;

  return (
    <Select value={value} onChange={onChange} className={`backlog-status-select ${selectStatusType} ${className}`}>
      {status.map((option) => (
        <Option key={option.name} value={option.name} className="backlog-status-option">
          {option.name}
        </Option>
      ))}
    </Select>
  );
}

export default BacklogStatusSelect;
