import React from 'react';
import { Input } from 'antd';
import './BacklogTextArea.css';

type BacklogTextAreaPropsTypes = {
  value: number;
  onChange(e: any): void;
  placeholder?: string;
  className?: string;
  autoSize?: { minRows: number; maxRows: number };
};

const { TextArea } = Input;

function BacklogTextArea(props: BacklogTextAreaPropsTypes): JSX.Element {
  const { value, onChange, placeholder, className, autoSize } = props;

  return (
    <TextArea
      value={value}
      onChange={onChange}
      className={`backlog-textarea ${className}`}
      placeholder={placeholder}
      autoSize={autoSize}
    />
  );
}

BacklogTextArea.defaultProps = {
  placeholder: '',
  className: '',
  autoSize: { minRows: 5, maxRows: 8 },
};

export default BacklogTextArea;
