import React from 'react';
import { Input } from 'antd';
import './BacklogSummaryInput.css';

type BacklogSummaryInputPropsTypes = {
  value?: string;
  onChange?(e: React.ChangeEvent<HTMLTextAreaElement>): void;
  onBlur?(e: React.FocusEvent<HTMLTextAreaElement, Element>): void;
  placeholder?: string;
  className?: string;
};

function BacklogSummaryInput(props: BacklogSummaryInputPropsTypes): JSX.Element {
  const { TextArea } = Input;
  const { value, onBlur, onChange, placeholder, className } = props;

  return (
    <TextArea
      className={`summary-input ${className}`}
      placeholder={placeholder}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      autoSize={{ minRows: 1 }}
    />
  );
}

BacklogSummaryInput.defaultProps = {
  placeholder: '',
  className: '',
  value: undefined,
  onChange: undefined,
  onBlur: undefined,
};

export default BacklogSummaryInput;
