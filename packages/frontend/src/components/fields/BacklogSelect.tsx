import React from 'react';
import { Select } from 'antd';
import type { BacklogSelectTypes } from '../../helpers/BacklogModal.types';
import './BacklogSelect.css';
import { Sprint } from '../../api/sprint';

type BacklogSelectPropsTypes = {
  value?: string | number;
  onChange?(e: number | string | undefined): void;
  options: BacklogSelectTypes[];
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
  fixedValue?: BacklogSelectTypes | undefined; // cannot change
  defaultValue?: BacklogSelectTypes | undefined; // can change
  showSearch?: boolean;
};

const { Option } = Select;

function BacklogSelect(props: BacklogSelectPropsTypes): JSX.Element {
  const { value, onChange, options, placeholder, className, allowClear, fixedValue, defaultValue, showSearch } = props;

  return (
    <>
      {fixedValue ? (
        <Select
          value={value}
          onChange={onChange}
          className={`backlog-select ${className}`}
          placeholder={placeholder}
          allowClear={allowClear}
          defaultValue={fixedValue.name}
          disabled={true}
        >
          <Option key={fixedValue.id} value={fixedValue.id}>
            {fixedValue.name}
          </Option>
        </Select>
      ) : defaultValue ? (
        <Select
          value={value}
          onChange={onChange}
          className={`backlog-select ${className}`}
          placeholder={placeholder}
          allowClear={allowClear}
          defaultValue={defaultValue.name}
        >
          {options.map((option) => (
            <Option key={option.id} value={option.id}>
              {option.name}
            </Option>
          ))}
        </Select>
      ) : showSearch ?  (
        <Select
          value={value}
          onChange={onChange}
          className={`backlog-select ${className}`}
          placeholder={placeholder}
          allowClear={allowClear}
          showSearch={showSearch}
          optionFilterProp="label"
          options={options.map((option) => (
            {
              label: option.name,
              value: option.id
            }
          ))}
        />
      ): (
        <Select
          value={value}
          onChange={onChange}
          className={`backlog-select ${className}`}
          placeholder={placeholder}
          allowClear={allowClear}
        >
          {options.map((option) => (
            <Option key={option.id} value={option.id}>
              {option.labelComponent || option.name}
            </Option>
          ))}
        </Select>
      )}
    </>
  );
}

BacklogSelect.defaultProps = {
  className: '',
  allowClear: false,
  value: undefined,
  onChange: undefined,
  placeholder: '',
  showSearch: false,
};

export default BacklogSelect;
