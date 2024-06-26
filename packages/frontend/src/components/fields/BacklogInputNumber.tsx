import React from 'react';
import { InputNumber } from 'antd';
import './BacklogInputNumber.css';

type BacklogInputNumberPropsTypes = {
  value?: number;
  onChange?(e: number | null): void;
  onBlur?(e: React.FocusEvent<HTMLInputElement, Element> | undefined): void;
  placeholder?: string;
  className?: string;
  defaultValue?: number;
};

function BacklogInputNumber(props: BacklogInputNumberPropsTypes): JSX.Element {
  const { value, onBlur, onChange, placeholder, className, defaultValue } = props;

  return (
    defaultValue ?
    (<InputNumber
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      className={`backlog-inputnumber ${className}`}
      placeholder={placeholder}
      min={1}
      defaultValue={defaultValue}
    />) :
    (<InputNumber
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      className={`backlog-inputnumber ${className}`}
      placeholder={placeholder}
      min={1}
    />)
  );
}

BacklogInputNumber.defaultProps = {
  placeholder: '',
  className: '',
  value: undefined,
  onChange: undefined,
  onBlur: undefined,
  defaultValue: undefined,
};

export default BacklogInputNumber;
