import React from 'react';
import { Select } from 'antd';
import { sortBacklogStatus } from '../../helpers/sortBacklogStatus';
import { BacklogStatusData } from '../../api/types';
import './BacklogStatusSelect.css';

type BacklogStatusSelectPropsTypes = {
  value?: string | number;
  onChange?(e: number | string | undefined): void;
  className?: string;
  status: Omit<BacklogStatusData, 'projectId'>[];
};

const { Option } = Select;

function BacklogStatusSelect(props: BacklogStatusSelectPropsTypes): JSX.Element {
  const { value, onChange, className, status } = props;

  const selectStatusType = status.filter((s) => s.name === value)?.[0]?.type;

  const sortedStatuses = sortBacklogStatus(status);

  return (
    <Select value={value} onChange={onChange} className={`backlog-status-select ${selectStatusType} ${className}`}>
      {sortedStatuses.map((option) => (
        <Option key={option.name} value={option.name} className="backlog-status-option">
          {option.name}
        </Option>
      ))}
    </Select>
  );
}

export default BacklogStatusSelect;
