import { Button, Col, Form, Input, Modal, Row } from 'antd';
import { useState } from 'react';
import './EpicCreationModal.css';
import { useParams } from 'react-router-dom';
import { useAddEpicMutation } from '../../api/socket/backlogHooks';
import { EpicFormFields } from '../../helpers/EpicModal.types';

function EpicCreationModal({ disabled }: { disabled?: boolean }): JSX.Element {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const params = useParams();
  const [form] = Form.useForm();

  const projectId = Number(params.projectId);

  const [addEpic] = useAddEpicMutation();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFormSubmit = async (data: FormData): Promise<void> => {
    setIsLoading(true);

    const payload: EpicFormFields = {
      ...data,
      projectId: Number(params.projectId),
    };

    try {
      await addEpic({ epic: payload }).unwrap();
      setIsModalVisible(false);
      form.resetFields();
      console.log('Success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFooter = (): JSX.Element[] => [
    <Button form="newEpic" key="submit" type="primary" htmlType="submit" loading={isLoading}>
      Create
    </Button>,
  ];

  const renderContent = (): JSX.Element => (
    <Form id="newEpic" form={form} onFinish={handleFormSubmit} layout="vertical">
      <Form.Item name="name" rules={[{ required: true }]} label="Epic Name">
        <Input placeholder="An awesome epic name..." />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Describe the goals of this epic..." autoSize={{ minRows: 5, maxRows: 8 }} />
      </Form.Item>
    </Form>
  );

  return (
    <>
      <Button disabled={disabled} className="new-epic-btn" type="primary" onClick={showModal}>
        New Epic
      </Button>
      <Modal
        title="New Epic"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={renderFooter()}
        width={600}
      >
        {renderContent()}
      </Modal>
    </>
  );
}

export default EpicCreationModal;
