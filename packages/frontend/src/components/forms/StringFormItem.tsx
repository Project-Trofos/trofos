import React from 'react';
import { Form, Input } from 'antd';
import { LabelTooltipType } from 'antd/lib/form/FormItemLabel';

type FormItemProps = {
  label: string;
  name: string;
  tooltip?: LabelTooltipType;
  isTextArea?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  initialValue?: string;
};

// Input item for any string input
export default function StringFormItem(props: FormItemProps): JSX.Element {
  const { isDisabled, isRequired, label, name, tooltip, initialValue, isTextArea: useTextArea } = props;
  return (
    <Form.Item
      label={label}
      name={name}
      rules={isRequired ? [{ required: true, message: `Please input ${label.toLowerCase()}!` }] : []}
      tooltip={tooltip}
      initialValue={initialValue}
    >
      {useTextArea ? <Input.TextArea rows={4} disabled={isDisabled} /> : <Input disabled={isDisabled} />}
    </Form.Item>
  );
}
