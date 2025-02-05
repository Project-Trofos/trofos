import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Select, DatePicker } from 'antd';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAddSprintMutation, useUpdateSprintMutation } from '../../api/socket/sprintHooks';
import type { Sprint } from '../../api/sprint';
import type { SprintFormFields, SprintUpdatePayload, AutoSprintTypes } from '../../helpers/SprintModal.types';
import './SprintCreationModal.css';
import { STEP_PROP, StepTarget } from '../tour/TourSteps';

const DURATION = [
  { id: 1, name: '1 Week' },
  { id: 2, name: '2 Weeks' },
  { id: 3, name: '3 Weeks' },
  { id: 4, name: '4 Weeks' },
  { id: 0, name: 'custom' },
];

function SprintCreationModal(props: SprintCreationModalPropsTypes): JSX.Element {
  const { isModalVisible, setIsModalVisible, sprint, setSprint, latestSprint } = props;
  const params = useParams();
  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;
  const { Option } = Select;
  const { TextArea } = Input;

  const [addSprint] = useAddSprintMutation();
  const [updateSprint] = useUpdateSprintMutation();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sprint) {
      return form.setFieldsValue({
        name: latestSprint.name,
        duration: latestSprint.duration,
        dates: latestSprint.dates,
        startDate: latestSprint.dates ? latestSprint.dates[0] : undefined,
        goals: undefined,
      });
    }

    return form.setFieldsValue({
      ...sprint,
      startDate: sprint?.start_date ? dayjs(sprint.start_date) : undefined,
      dates: sprint?.start_date && sprint?.end_date ? [dayjs(sprint.start_date), dayjs(sprint.end_date)] : undefined,
    });
  }, [sprint, latestSprint]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setSprint(undefined);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSprint(undefined);
  };

  const handleProcessDate = (data: SprintFormFields) => {
    const { duration, startDate, dates } = data;
    const updatedData = { ...data };

    if ((duration !== 0 && !startDate) || (duration === 0 && !dates)) {
      updatedData.dates = null;
      delete updatedData.startDate;
      return updatedData;
    }

    if (duration !== 0) {
      updatedData.dates = [
        dayjs(startDate).toString(),
        dayjs(startDate)
          .add(duration * 7, 'day')
          .toString(),
      ];
      delete updatedData.startDate;
    }

    return updatedData;
  };

  const handleFormSubmit = async (data: SprintFormFields): Promise<void> => {
    setIsLoading(true);

    const processedPayload = handleProcessDate(data);

    const payload: SprintFormFields = {
      ...processedPayload,
      projectId: Number(params.projectId),
    };

    try {
      await addSprint(payload).unwrap();
      setIsModalVisible(false);
      form.resetFields();
      console.log('Success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSprint = async (data: SprintFormFields): Promise<void> => {
    setIsLoading(true);

    if (!sprint) {
      return;
    }

    const processedPayload = handleProcessDate(data);

    const payload: SprintUpdatePayload = {
      ...processedPayload,
      sprintId: sprint.id,
      projectId: sprint.project_id,
    };

    try {
      await updateSprint(payload).unwrap();
      setIsModalVisible(false);
      setSprint(undefined);
      message.success('Sprint updated');
      console.log('Success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFooter = (): JSX.Element[] => [
    <Button form="newSprint" key="submit" type="primary" htmlType="submit" loading={isLoading}>
      {sprint ? 'Update' : 'Create'}
    </Button>,
  ];

  const renderDatePicker = () => {
    if (form.getFieldValue('duration') === 0) {
      return (
        <Form.Item name="dates" label="Start and End Date">
          <RangePicker />
        </Form.Item>
      );
    }
    return (
      <Form.Item name="startDate" label="Start Date">
        <DatePicker />
      </Form.Item>
    );
  };

  const renderContent = (): JSX.Element => (
    <Form id="newSprint" form={form} onFinish={sprint ? handleUpdateSprint : handleFormSubmit} layout="vertical">
      <Form.Item name="name" rules={[{ required: true }]} label="Sprint Name">
        <Input />
      </Form.Item>
      <Form.Item name="duration" rules={[{ required: true }]} label="Duration">
        <Select>
          {DURATION.map((duration) => (
            <Option key={duration.id} value={duration.id}>
              {duration.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.duration !== currentValues.duration}>
        {renderDatePicker}
      </Form.Item>
      <Form.Item name="goals" label="Sprint Goals">
        <TextArea autoSize={{ minRows: 5, maxRows: 8 }} />
      </Form.Item>
    </Form>
  );

  return (
    <>
      <Button
        className="new-sprint-btn"
        type="primary"
        onClick={showModal}
        {...{ [STEP_PROP]: StepTarget.NEW_SPRINT_BUTTON }}
      >
        New Sprint
      </Button>
      <Modal
        title="New Sprint"
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

type SprintCreationModalPropsTypes = {
  isModalVisible: boolean;
  setIsModalVisible(isVisible: boolean): void;
  sprint?: Sprint;
  setSprint(sprint: Sprint | undefined): void;
  latestSprint: AutoSprintTypes;
};

SprintCreationModal.defaultProps = {
  sprint: undefined,
};

export default SprintCreationModal;
