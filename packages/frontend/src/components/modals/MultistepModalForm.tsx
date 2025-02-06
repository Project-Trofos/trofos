import React, { useState } from 'react';
import { Button, Form, FormInstance, Modal } from 'antd';

export type MultistepFromModalProps<T> = {
  title: string;
  formName?: string;
  form?: FormInstance<T>;
  openState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  formSteps: React.ReactNode[];
  onSubmit: (data: T) => Promise<void>;
  buttonElement?: 'button' | 'span' | 'none';
  buttonType?: 'link' | 'text' | 'primary' | 'default' | 'dashed' | undefined;
  buttonSize?: 'small' | 'middle' | 'large';
  buttonChildren?: React.ReactNode | string;
  tourProps?: Record<string, string>; // Optional tourProps for steps targeting
  disableClickEvent?: boolean;
};

/**
 * A multi-step form built around Antd's Form and Modal
 */
export default function MultistepFormModal<T>(props: MultistepFromModalProps<T>) {
  const {
    form: deprecatedForm,
    formName = 'multi-step-modal-form',
    formSteps,
    openState,
    onSubmit,
    title,
    buttonElement = 'button',
    buttonType = 'default',
    buttonChildren,
    buttonSize,
    tourProps = {},
    disableClickEvent = false,
  } = props;

  // TODO: Remove deprecatedForm in next major version
  // TODO: Decouple button from modal
  const [form] = deprecatedForm ? [deprecatedForm] : Form.useForm();
  const [isModalVisible, setIsModalVisible] = openState ? openState : useState(false);
  const [data, setData] = useState<Partial<T>>({});
  const [step, setStep] = useState<number>(0);

  const showModal = () => {
    setStep(0);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setStep(0);
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleFinish = async () => {
    try {
      await form.validateFields();
    } catch (e) {
      console.error(e);
      return;
    }
    const partialData = form.getFieldsValue();
    const completeData = { ...data, ...partialData };
    try {
      await onSubmit(completeData);
    } catch (e) {
      console.error(e);
      return;
    }
    handleOk();
  };

  const onNext = async () => {
    form
      .validateFields()
      .then(() => {
        const partialData = form.getFieldsValue();
        setData((d) => ({ ...d, ...partialData }));
        setStep((i) => i + 1);
      })
      .catch((e) => {});
  };

  return (
    <>
      {buttonElement === 'button' && (
        <Button
          aria-label="open-form"
          onClick={disableClickEvent ? undefined : showModal}
          type={buttonType}
          size={buttonSize}
          {...tourProps}
        >
          {buttonChildren}
        </Button>
      )}
      {buttonElement === 'span' && <span onClick={disableClickEvent ? undefined : showModal}>{buttonChildren}</span>}
      <Modal
        title={title}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={
          step < formSteps.length - 1
            ? [
                <Button key="cancel" onClick={handleCancel}>
                  Cancel
                </Button>,
                <Button key="next" type="primary" onClick={onNext}>
                  Next
                </Button>,
              ]
            : [
                formSteps.length === 1 ? undefined : (
                  <Button key="prev" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                ),
                <Button type="primary" form="multi-step-modal-form" key="submit" onClick={handleFinish}>
                  Finish
                </Button>,
              ]
        }
      >
        <Form name={formName} layout="vertical" form={form} onFinish={onSubmit} autoComplete="off">
          {formSteps[step]}
        </Form>
      </Modal>
    </>
  );
}
