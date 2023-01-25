import React, { useEffect } from 'react';
import { Form, DatePicker, Select, Button, message } from 'antd';
import dayjs from 'dayjs';
import { getErrorMessage } from '../../helpers/error';
import { Settings } from '../../api/types';
import { useUpdateSettingsMutation } from '../../api/settings';

type SettingsFormPropType = {
  settings: Settings | undefined;
};

const CURRENT_YEAR = 'current-year';
const CURRENT_SEMESTER = 'current-semester';

export default function SettingsForm(props: SettingsFormPropType) {
  const { settings } = props;

  const [form] = Form.useForm();

  const [updateSettings] = useUpdateSettingsMutation();

  const handleSave = async () => {
    try {
      const setting = {
        current_year: form.getFieldsValue()[CURRENT_YEAR].year(),
        current_sem: form.getFieldsValue()[CURRENT_SEMESTER],
      } as Settings;
      await updateSettings(setting).unwrap();
      message.success('System settings successfully updated!');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    form.resetFields();
  }, [settings, form]);

  return (
    <>
      <Form
        form={form}
        initialValues={{
          [CURRENT_YEAR]: dayjs().year(settings?.current_year ?? dayjs().year()),
          [CURRENT_SEMESTER]: settings?.current_sem ?? 1,
        }}
      >
        <Form.Item name={CURRENT_YEAR} key={CURRENT_YEAR} rules={[{ required: true }]} label="Current Year">
          <DatePicker picker="year" style={{ width: 200 }} size="middle" />
        </Form.Item>
        <Form.Item name={CURRENT_SEMESTER} key={CURRENT_SEMESTER} rules={[{ required: true }]} label="Current Semester">
          <Select placeholder="Select a semester" style={{ width: 200 }} size="middle">
            <Select.Option key="1" value={1}>
              1
            </Select.Option>
            <Select.Option key="2" value={2}>
              2
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
      <Button type="primary" onClick={handleSave}>
        Save
      </Button>
    </>
  );
}
