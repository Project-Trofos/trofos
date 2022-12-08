import React, { useState } from 'react';
import { Button, Form, FormInstance, Modal } from 'antd';

export type MultistepFromModalProps<T> = {
  title: string;
  form: FormInstance<T>;
  formSteps: React.ReactNode[];
  onSubmit: (data: T) => Promise<void>;
  buttonName: string;
  buttonType?: 'button' | 'span';
};

/**
 * A multi-step form built around Antd's Form and Modal
 */
export default function MultistepFormModal<T>(props: MultistepFromModalProps<T>) {
  const { form, formSteps, onSubmit, buttonName, title, buttonType = 'button' } = props;

  const [isModalVisible, setIsModalVisible] = useState(false);
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
      {buttonType === 'button' && (
        <Button onClick={showModal} type="primary">
          {buttonName}
        </Button>
      )}
      {buttonType === 'span' && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <span onClick={showModal}>{buttonName}</span>
      )}
      <Modal
        title={title}
        visible={isModalVisible}
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
        <Form
          name="multi-step-modal-form"
          layout="vertical"
          form={form}
          wrapperCol={{ span: 20 }}
          onFinish={onSubmit}
          autoComplete="off"
        >
          {formSteps[step]}
        </Form>
      </Modal>
    </>
  );
}
