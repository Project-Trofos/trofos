import React from 'react';
import { Select as AntdSelect, DatePicker as AntdDatePicker } from 'antd';
import mockDayjs from 'dayjs';

// Mock certain antd component to simplify testing in React Testing Library
vi.mock('antd', async () => { 
  const antd: any = await vi.importActual('antd');
  antd.theme.defaultConfig.hashed = false;

  function DatePicker(props: React.ComponentProps<typeof AntdDatePicker>) {
    const { defaultValue, placeholder, disabled, id, onChange } = props;
    return (
      <input
        id={id}
        defaultValue={defaultValue as React.SelectHTMLAttributes<HTMLInputElement>['defaultValue']}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          if (onChange) {
            onChange(mockDayjs(e.target.value) as unknown as Parameters<typeof onChange>['0'], e.target.value);
          }
        }}
      />
    );
  }

  function RangePicker(props: React.ComponentProps<typeof AntdDatePicker.RangePicker>) {
    const { defaultValue, id, onChange } = props;
    return (
      <input
        id={id as string | undefined}
        defaultValue={defaultValue as React.SelectHTMLAttributes<HTMLInputElement>['defaultValue']}
        onChange={(e) => {
          if (onChange) {
            onChange(
              [mockDayjs(e.target.value), mockDayjs(e.target.value)] as unknown as Parameters<typeof onChange>['0'],
              [e.target.value, e.target.value],
            );
          }
        }}
      />
    );
  }

  DatePicker.RangePicker = RangePicker;

  function Select(props: React.ComponentProps<typeof AntdSelect>) {
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
