import React from 'react';
import { Input } from 'antd';
import './BacklogSummaryInput.css';

type BacklogSummaryInputPropsTypes = {
  value: string;
  onChange(e: any): void;
  placeholder?: string;
  className?: string;
};

function BacklogSummaryInput(props: BacklogSummaryInputPropsTypes): JSX.Element {
  const { value, onChange, placeholder, className } = props;

  return <Input className={`summary-input ${className}`} placeholder={placeholder} value={value} onChange={onChange} />;
}

BacklogSummaryInput.defaultProps = {
  placeholder: '',
  className: '',
};

export default BacklogSummaryInput;
