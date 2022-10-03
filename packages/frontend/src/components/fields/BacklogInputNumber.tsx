import React from 'react';
import { InputNumber } from 'antd';
import './BacklogInputNumber.css';

type BacklogInputNumberPropsTypes = {
  value: number;
  onChange(e: any): void;
  placeholder?: string;
  className?: string;
};

function BacklogInputNumber(props: BacklogInputNumberPropsTypes): JSX.Element {
  const { value, onChange, placeholder, className } = props;

  return (
    <InputNumber
      value={value}
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
};

export default BacklogInputNumber;
