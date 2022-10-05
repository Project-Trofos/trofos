import React from 'react';
import { Input } from 'antd';
import './BacklogSummaryInput.css';

type BacklogSummaryInputPropsTypes = {
  value: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  onBlur?(e: React.FocusEvent<HTMLInputElement, Element>): void;
  placeholder?: string;
  className?: string;
};

function BacklogSummaryInput(props: BacklogSummaryInputPropsTypes): JSX.Element {
  const { value, onBlur, onChange, placeholder, className } = props;

  return (
    <Input
      className={`summary-input ${className}`}
      placeholder={placeholder}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
}

BacklogSummaryInput.defaultProps = {
  placeholder: '',
  className: '',
  onBlur: undefined,
};

export default BacklogSummaryInput;
