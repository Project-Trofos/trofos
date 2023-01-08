import React from 'react';
import { Form, Select } from 'antd';
import { DatePicker } from '../datetime';

type CourseYearSemFormItemsProps = {
  yearLabel?: string;
  semLabel?: string;
  yearName?: string;
  semName?: string;
};

// Renders form elements to input year and semester
export default function CourseYearSemFormItems({
  yearLabel = 'Academic Year',
  semLabel = 'Semester',
  yearName = 'courseYear',
  semName = 'courseSem',
}: CourseYearSemFormItemsProps): JSX.Element {
  return (
    <>
      <Form.Item
        label={yearLabel}
        name={yearName}
        rules={[{ required: true, message: "Please input your course's year!" }]}
      >
        <DatePicker picker="year" />
      </Form.Item>

      <Form.Item
        label={semLabel}
        name={semName}
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
