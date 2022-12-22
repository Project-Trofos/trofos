import React from 'react';
import { Form, Input } from 'antd';
import { LabelTooltipType } from 'antd/lib/form/FormItemLabel';

type FormItemProps = {
  label: string;
  name: string;
  tooltip?: LabelTooltipType;
  isDisabled?: boolean;
  isRequired?: boolean;
};

// Input item for any string input
export default function StringFormItem({ isDisabled, isRequired, label, name, tooltip }: FormItemProps): JSX.Element {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={isRequired ? [{ required: true, message: `Please input ${label.toLowerCase()}!` }] : []}
      tooltip={tooltip}
    >
      <Input disabled={isDisabled} />
    </Form.Item>
  );
}
