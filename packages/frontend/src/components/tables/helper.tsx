import React from 'react';
import { Input } from 'antd';

// A simple filter dropdown to filter element based on keys
export const filterDropdown = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
}: {
  setSelectedKeys: (keys: React.Key[]) => void;
  selectedKeys: React.Key[];
  confirm: () => void;
}) => (
  <Input
    value={selectedKeys[0]}
    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
    onPressEnter={() => confirm()}
    onBlur={() => confirm()}
    placeholder="type to filter"
  />
);

export const displayDateTime = (date: Date) => {
  // Small workaround
  const d = new Date(date);

  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};
