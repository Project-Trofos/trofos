import React, { useCallback } from 'react';
import { Form } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import MultistepFormModal from './MultistepModalForm';
import StringFormItem from '../forms/StringFormItem';

type AnnouncementUpdateModalProps = {
  initialTitle: string;
  initialContent: string;
  handleUpdate: (payload: { announcementTitle?: string; announcementContent?: string }) => Promise<void>;
};

/**
 * Modal for updating announcement
 */
export default function AnnouncementUpdateModal(props: AnnouncementUpdateModalProps) {
  const { handleUpdate, initialContent, initialTitle } = props;

  const [form] = Form.useForm();

  const onFinish = useCallback(
    async (values: { announcementTitle?: string; announcementContent?: string }) => {
      const { announcementContent, announcementTitle } = values;
      await handleUpdate({
        announcementTitle,
        announcementContent,
      });
    },
    [handleUpdate],
  );

  return (
    <MultistepFormModal
      title="Update Announcement"
      form={form}
      onSubmit={onFinish}
      buttonChildren={<EditOutlined />}
      buttonSize="small"
      formSteps={[
        <>
          <StringFormItem label="Announcement Title" name="announcementTitle" isRequired initialValue={initialTitle} />
          <StringFormItem
            label="Announcement Content"
            name="announcementContent"
            isRequired
            isTextArea
            initialValue={initialContent}
          />
        </>,
      ]}
    />
  );
}
