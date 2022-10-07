import { Form, DatePicker, Select } from 'antd';
import React from 'react';

// Renders form elements to input year and semester
export default function CourseYearSemFormItems(): JSX.Element {
  return (
    <>
      <Form.Item
        label="Academic Year"
        name="courseYear"
        rules={[{ required: true, message: "Please input your course's year!" }]}
      >
        <DatePicker picker="year" />
      </Form.Item>

      <Form.Item
        label="Semester"
        name="courseSem"
        rules={[{ required: true, message: "Please input your course's semester!" }]}
      >
        <Select placeholder="Select a semester">
          <Select.Option key="1" value="1">
            1
          </Select.Option>
          <Select.Option key="2" value="2">
            2
          </Select.Option>
        </Select>
      </Form.Item>
    </>
  );
}
