import React from 'react';
import { Button, Form } from 'antd';

// Provide a form wrapper to test form items
export default function FormWrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <Form>
      {children}
      <Button htmlType="submit">submit</Button>
    </Form>
  );
}
