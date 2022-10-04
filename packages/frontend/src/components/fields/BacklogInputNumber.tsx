import React from 'react';
import { InputNumber } from 'antd';
import './BacklogInputNumber.css';

type BacklogInputNumberPropsTypes = {
  value: number | undefined;
  onChange(e: any): void;
  onBlur?(e: any): void;
  placeholder?: string;
  className?: string;
};

function BacklogInputNumber(props: BacklogInputNumberPropsTypes): JSX.Element {
  const { value, onBlur, onChange, placeholder, className } = props;

  return (
    <InputNumber
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      className={`backlog-inputnumber ${className}`}
      placeholder={placeholder}
      min={1}
    />
  );
}

BacklogInputNumber.defaultProps = {
  placeholder: '',
  className: '',
  onBlur: undefined,
};

export default BacklogInputNumber;
