import { Form, Select } from 'antd';
import React from 'react';

// Renders form elements to select course code from a list of options
export default function SelectCourseCodeFormItem({
  courseOptions,
  searchCourseKeyword,
  setSearchCourseKeyword,
}: {
  courseOptions: JSX.Element[],
  searchCourseKeyword: string,
  setSearchCourseKeyword: (value: string) => void,
}): JSX.Element {
  return (
    <Form.Item label="Course" name="courseCode" rules={[{ required: true, message: 'Please select course!' }]}>
      <Select
        showSearch
        value={searchCourseKeyword}
        onChange={(value) => setSearchCourseKeyword(value)}
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
