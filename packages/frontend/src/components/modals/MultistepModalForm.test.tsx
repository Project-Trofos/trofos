import React from 'react';
import { Form, Input } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import MultistepFormModal, { MultistepFromModalProps } from './MultistepModalForm';

function FormWrapper<T>(props: Omit<MultistepFromModalProps<T>, 'form'>) {
  const [form] = Form.useForm();
  const { title, buttonName, formSteps, onSubmit } = props;

  return (
    <MultistepFormModal title={title} form={form} buttonName={buttonName} formSteps={formSteps} onSubmit={onSubmit} />
  );
}

describe('test button form modal', () => {
  const setup = () => {
    const TITLE = 'title';
    const BUTTON_NAME = 'button-name';
    const LABEL = 'label';
    const ATTR_NAME = 'attrName';
    const onSubmitFunction = jest.fn();

    const { baseElement } = render(
      <FormWrapper
        title={TITLE}
        buttonName={BUTTON_NAME}
        formSteps={[
          <Form.Item label={LABEL} name={ATTR_NAME}>
            <Input />
          </Form.Item>,
        ]}
        onSubmit={onSubmitFunction}
      />,
    );

    return {
      baseElement,
      BUTTON_NAME,
      LABEL,
      ATTR_NAME,
      onSubmitFunction,
    };
  };

  test('render modal correctly', async () => {
    const { BUTTON_NAME, LABEL, baseElement } = setup();

    expect(baseElement).toMatchSnapshot();

    // Should have rendered button with correct name
    screen.getByText(BUTTON_NAME);

    // Modal should be initially invisible
    expect(screen.queryByText(LABEL)).toBeNull();
  });

  test('modal should appear when button is pressed', async () => {
    const { BUTTON_NAME, LABEL, baseElement } = setup();

    const button = screen.getByText(BUTTON_NAME);

    // Click on button should show modal
    fireEvent.click(button);
    await screen.findByLabelText(LABEL);

    expect(baseElement).toMatchSnapshot();
  });

  test('form should be able to be submitted', async () => {
    const { ATTR_NAME, BUTTON_NAME, LABEL, onSubmitFunction } = setup();
    const INPUT_VALUE = 'InputValue';

    const button = screen.getByText(BUTTON_NAME);
    fireEvent.click(button);
    const input = await screen.findByLabelText(LABEL);

    fireEvent.change(input, { target: { value: INPUT_VALUE } });
    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);

    // Call may not be immediate
    await waitFor(() => expect(onSubmitFunction).toBeCalledWith({ [ATTR_NAME]: INPUT_VALUE }));
  });
});
