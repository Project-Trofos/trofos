import React, { useState } from 'react';
import { RobotOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space, Tooltip, Typography, message } from 'antd';
import { getErrorMessage } from '../../helpers/error';

const MAX_TEXT_LENGTH = 5000;

const { Text } = Typography;

type AiAssistProps = {
  // Returns the form values to set; fields the AI could not determine should be omitted
  autofill: (text: string) => Promise<Record<string, unknown>>;
  subject: string;
  placeholder: string;
  children?: React.ReactNode;
};

/**
 * Toggleable panel that fills the surrounding form from free text.
 * Renders `children` (the form's intro text) inline with the AI toggle.
 * Must be rendered inside an Antd Form.
 */
export default function AiAssist({ autofill, subject, placeholder, children }: AiAssistProps): JSX.Element {
  const form = Form.useFormInstance();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState('');

  const onFill = async () => {
    setIsLoading(true);
    try {
      const values = await autofill(text);
      if (Object.keys(values).length === 0) {
        message.warning(`Could not find any ${subject} details in the text.`);
        return;
      }
      form.setFieldsValue(values);
      message.info('Fields filled. Please verify the details before submitting.');
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
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
            placeholder={placeholder}
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
