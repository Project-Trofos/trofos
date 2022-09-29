import React from 'react';
import { Select as AntdSelect, DatePicker as AntdDatePicker } from 'antd';

// Mock certain antd component to simplify testing in React Testing Library
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');

  function DatePicker(props: React.ComponentProps<typeof AntdDatePicker>) {
    // eslint-disable-next-line react/prop-types
    const { defaultValue, placeholder, disabled, id, onChange } = props;
    return (
      <input
        id={id}
        defaultValue={defaultValue as React.SelectHTMLAttributes<HTMLInputElement>['defaultValue']}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          if (onChange) {
            onChange(jest.fn() as unknown as Parameters<typeof onChange>['0'], e.target.value);
          }
        }}
      />
    );
  }

  function Select(props: React.ComponentProps<typeof AntdSelect>) {
    // eslint-disable-next-line react/prop-types
    const { mode, value, defaultValue, className, onChange, disabled, children, id } = props;

    const multiple = ['tags', 'multiple'].includes(mode ?? '');

    return (
      <select
        id={id}
        value={value as React.SelectHTMLAttributes<HTMLSelectElement>['value']}
        defaultValue={defaultValue as React.SelectHTMLAttributes<HTMLSelectElement>['defaultValue']}
        multiple={multiple}
        disabled={disabled}
        className={className}
        onChange={(e) => {
          if (onChange) {
            onChange(
              multiple ? Array.from(e.target.selectedOptions).map((option) => option.value) : e.target.value,
              {},
            );
          }
        }}
      >
        {children}
      </select>
    );
  }

  function Option({ children, ...otherProps }: { children: React.ReactNode }) {
    return <option {...otherProps}>{children}</option>;
  }
  function OptGroup({ children, ...otherProps }: { children: React.ReactNode }) {
    return <optgroup {...otherProps}>{children}</optgroup>;
  }

  Select.Option = Option;
  Select.OptGroup = OptGroup;

  return { ...antd, Select, DatePicker };
});
