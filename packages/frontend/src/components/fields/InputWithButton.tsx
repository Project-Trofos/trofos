import React, { useState } from 'react';
import { Space, Input, Button } from 'antd';

type InputWithButtonProps = {
  handleClick: (value: string) => void;
  buttonText?: string;
  inputPlaceholder?: string;
};

export default function InputWithButton({ handleClick, buttonText, inputPlaceholder }: InputWithButtonProps) {
  const [value, setValue] = useState('');

  return (
    <Space style={{ display: 'flex' }}>
      <Input
        onPressEnter={() => handleClick(value)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={inputPlaceholder}
      />

      <Button htmlType="submit" onClick={() => handleClick(value)}>
        {buttonText}
      </Button>
    </Space>
  );
}
