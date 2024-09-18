import React, { useState } from 'react';
import { Space, Input, Button } from 'antd';

type InputWithButtonProps = {
  handleClick: (value: string) => void;
  buttonText?: string;
  inputPlaceholder?: string;
};

export default function InputWithButton({ handleClick, buttonText, inputPlaceholder }: InputWithButtonProps) {
  const [value, setValue] = useState('');
  const [isError, setIsError] = useState(false);

  return (
    <Space style={{ display: 'flex' }}>
      <Input
        onPressEnter={() => handleClick(value)}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={inputPlaceholder}
        status={isError ? 'error' : undefined}
      />

      <Button
        htmlType="submit"
        onClick={() => {
          setIsError(!value);
          if (value) {
            handleClick(value);
          }
        }}
      >
        {buttonText}
      </Button>
    </Space>
  );
}
