import React, { useState } from 'react';
import { Button, Form, FormInstance, Modal } from 'antd';

export type MultistepFromModalProps<T> = {
  title: string;
  form: FormInstance<T>;
  formSteps: React.ReactNode[];
  onSubmit: (data: T) => void;
  buttonName: string;
};

/**
 * A multi-step form built around Antd's Form and Modal
 */
export default function MultistepFormModal<T>(props: MultistepFromModalProps<T>) {
  const { form, formSteps, onSubmit, buttonName, title } = props;

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

  const handleFinish = () => {
    form
      .validateFields()
      .then(() => {
        const partialData = form.getFieldsValue();
        const completeData = { ...data, ...partialData };
        onSubmit(completeData);
        handleOk();
      })
      .catch(console.error);
  };

  const onNext = () => {
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
      <Button onClick={showModal} type="primary">
        {buttonName}
      </Button>
      <Modal
        title={title}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        getContainer={false}
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
