import React, { useState } from 'react';
import { RobotOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Tooltip, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useAutofillCourseMutation } from '../../api/ai';
import { getErrorMessage } from '../../helpers/error';

const MAX_TEXT_LENGTH = 5000;

const { Text } = Typography;

/**
 * Toggleable panel that fills the surrounding course form from free text.
 * Renders `children` (the form's intro text) inline with the AI toggle.
 * Must be rendered inside an Antd Form.
 */
export default function CourseAiAssist({ children }: { children?: React.ReactNode }): JSX.Element {
  const form = Form.useFormInstance();
  const [autofillCourse, { isLoading }] = useAutofillCourseMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');

  const onFill = async () => {
    try {
      const { courseName, courseCode, courseYear, courseSem } = await autofillCourse({ text }).unwrap();

      // Only set fields the AI could determine, the rest are left untouched
      const values: Record<string, unknown> = {};
      if (courseName !== undefined) values.courseName = courseName;
      if (courseCode !== undefined) values.courseCode = courseCode;
      if (courseYear !== undefined) values.courseYear = dayjs().year(courseYear);
      if (courseSem !== undefined) values.courseSem = String(courseSem);

      if (Object.keys(values).length === 0) {
        message.warning('Could not find any course details in the text.');
        return;
      }
      form.setFieldsValue(values);
      message.info('Fields filled. Please verify the details before submitting.');
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        {children}
        <Text type="secondary">Or try with AI</Text>
        <Tooltip title="AI assist">
          <Button
            aria-label="AI assist"
            icon={<RobotOutlined />}
            size="small"
            type={isOpen ? 'primary' : 'default'}
            onClick={() => setIsOpen((open) => !open)}
          />
        </Tooltip>
      </div>
      {isOpen && (
        <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
          <Input.TextArea
            aria-label="AI assist input"
            rows={4}
            maxLength={MAX_TEXT_LENGTH}
            placeholder="Describe your course, e.g. CS3203 Software Engineering, Academic Year 2025, Semester 2"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={onFill} loading={isLoading} disabled={text.trim().length === 0}>
            Fill with AI
          </Button>
        </Space>
      )}
    </div>
  );
}
