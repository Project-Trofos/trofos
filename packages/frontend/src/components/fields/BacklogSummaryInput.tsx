import React from 'react';
import { Input } from 'antd';
import './BacklogSummaryInput.css';

type BacklogSummaryInputPropsTypes = {
  value?: string;
  onChange?(e: React.ChangeEvent<HTMLTextAreaElement>): void;
  onBlur?(e: React.FocusEvent<HTMLTextAreaElement, Element>): void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
};

function BacklogSummaryInput(props: BacklogSummaryInputPropsTypes): JSX.Element {
  const { TextArea } = Input;
  const { value, onBlur, onChange, placeholder, className, defaultValue } = props;

  return (
    defaultValue ? 
    (<TextArea
      className={`summary-input ${className}`}
      placeholder={defaultValue}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      autoSize={{ minRows: 1 }}
      defaultValue={defaultValue}
    />) :
    (<TextArea
      className={`summary-input ${className}`}
      placeholder={placeholder}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      autoSize={{ minRows: 1 }}
    />)
  );
}

BacklogSummaryInput.defaultProps = {
  placeholder: '',
  className: '',
  value: undefined,
  onChange: undefined,
  onBlur: undefined,
  defaultValue: undefined,
};

export default BacklogSummaryInput;
