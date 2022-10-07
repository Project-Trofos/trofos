import { Form, Select } from 'antd';
import React from 'react';

// Renders form elements to select course code from a list of options
export default function SelectCourseCodeFormItem({ courseOptions }: { courseOptions: JSX.Element[] }): JSX.Element {
  return (
    <Form.Item label="Course" name="courseCode" rules={[{ required: true, message: 'Please select course!' }]}>
      <Select
        showSearch
        placeholder="Search to Select"
        optionFilterProp="children"
        filterOption={(input, option) => {
          if (!option) {
            return false;
          }
          return (option.key as string).toLowerCase().includes(input.toLowerCase());
        }}
      >
        {courseOptions}
      </Select>
    </Form.Item>
  );
}
