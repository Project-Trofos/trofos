import React, { useState } from 'react';
import { Button, Space } from 'antd';

type ToggleButtonGroupProps = {
  titles: string[];
  onToggle: (value: string | null) => void;
};

const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({ titles, onToggle }) => {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const toggleButton = (button: string) => {
    const newValue = activeButton === button ? null : button;
    setActiveButton(newValue);
    onToggle(newValue);
  };

  return (
    <Space>
      {titles.map((title: string) => (
        <Button key={title} type={activeButton === title ? 'primary' : 'default'} onClick={() => toggleButton(title)}>
          {title}
        </Button>
      ))}
    </Space>
  );
};

export default ToggleButtonGroup;
