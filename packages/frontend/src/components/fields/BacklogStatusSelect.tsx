import React from 'react';
import { Select } from 'antd';
import './BacklogStatusSelect.css';

type BacklogStatusSelectPropsTypes = {
  value?: string | number;
  onChange?(e: number | string | undefined): void;
  className?: string;
};

const STATUS = [
  { id: 'todo', name: 'To do' },
  { id: 'in_progress', name: 'In progress' },
  { id: 'done', name: 'Done' },
];

const { Option } = Select;

function BacklogStatusSelect(props: BacklogStatusSelectPropsTypes): JSX.Element {
  const { value, onChange, className } = props;

  return (
    <Select value={value} onChange={onChange} className={`backlog-status-select ${value} ${className}`}>
      {STATUS.map((option) => (
        <Option key={option.id} value={option.id} className="backlog-status-option">
          {option.name}
        </Option>
      ))}
    </Select>
  );
}

export default BacklogStatusSelect;
