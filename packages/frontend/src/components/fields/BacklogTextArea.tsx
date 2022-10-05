import React from 'react';
import { Input } from 'antd';
import './BacklogTextArea.css';

type BacklogTextAreaPropsTypes = {
  value: string;
  onChange(e: React.ChangeEvent<HTMLTextAreaElement> | undefined): void;
  onBlur?(e: React.FocusEvent<HTMLTextAreaElement, Element> | undefined): void;
  placeholder?: string;
  className?: string;
  autoSize?: { minRows: number; maxRows: number };
};

const { TextArea } = Input;

function BacklogTextArea(props: BacklogTextAreaPropsTypes): JSX.Element {
  const { value, onBlur, onChange, placeholder, className, autoSize } = props;

  return (
    <TextArea
      value={value}
      onBlur={onBlur}
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
  autoSize: { minRows: 1, maxRows: 8 },
  onBlur: undefined,
};

export default BacklogTextArea;
