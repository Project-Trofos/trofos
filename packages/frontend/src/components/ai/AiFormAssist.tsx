import { useState } from 'react';
import { Button, Input, Space, Typography, message } from 'antd';
import type { FormInstance } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useParseWorkItemMutation } from '../../api/ai';
import { mapAiResponseToFormValues } from '../../helpers/aiItemCreationMapper';
import type { WorkItemContext, WorkItemType } from '../../helpers/aiItemCreation.types';
import { getErrorMessage } from '../../helpers/error';

type AiFormAssistProps = {
  itemType: WorkItemType;
  projectId: number;
  form: FormInstance;
  context?: WorkItemContext;
};

export default function AiFormAssist({ itemType, projectId, form, context }: AiFormAssistProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [parseWorkItem, { isLoading }] = useParseWorkItemMutation();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.warning('Describe what you want to create');
      return;
    }

    try {
      const response = await parseWorkItem({
        itemType,
        message: prompt.trim(),
        projectId,
        context,
      }).unwrap();

      const formValues = mapAiResponseToFormValues(response, context);
      form.setFieldsValue(formValues);
      message.success('Form populated from your description');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const itemLabel = itemType === 'backlog' ? 'backlog item' : itemType;

  if (!isVisible) {
    return (
      <div style={{ marginBottom: 16 }}>
        <Button type="dashed" icon={<RobotOutlined />} onClick={() => setIsVisible(true)}>
          Try with AI
        </Button>
      </div>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Text type="secondary">
          Describe the {itemLabel} in plain language and AI will fill the form below.
        </Typography.Text>
        <Button type="link" size="small" onClick={() => setIsVisible(false)}>
          Hide
        </Button>
      </div>
      <Input.TextArea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. Create a high-priority bug for login timeout, assign to John, 3 story points"
        autoSize={{ minRows: 2, maxRows: 5 }}
        disabled={isLoading}
      />
      <Button type="primary" onClick={handleGenerate} loading={isLoading} icon={<RobotOutlined />}>
        Fill form with AI
      </Button>
    </Space>
  );
}
