import React, { useCallback } from 'react';
import { Form, message } from 'antd';
import { useCreateAnnouncementMutation } from '../../api/course';
import MultistepFormModal from './MultistepModalForm';
import { getErrorMessage } from '../../helpers/error';
import StringFormItem from '../forms/StringFormItem';

/**
 * Modal for creating announcement
 */
export default function AnnouncementCreationModal({ courseId }: { courseId: string }) {
  const [createAnnouncement] = useCreateAnnouncementMutation();

  const [form] = Form.useForm();

  const onFinish = useCallback(
    async (values: { announcementTitle?: string; announcementContent?: string }) => {
      try {
        const { announcementContent, announcementTitle } = values;

        if (!announcementTitle || !announcementContent) {
          throw new Error('Please input valid title or content!');
        }

        await createAnnouncement({
          courseId,
          payload: {
            announcementTitle,
            announcementContent,
          },
        }).unwrap();
        message.success(`Announcement ${announcementTitle} has been created!`);
      } catch (err) {
        message.error(getErrorMessage(err));
        throw err;
      }
    },
    [createAnnouncement, courseId],
  );

  return (
    <MultistepFormModal
      title="Create Announcement"
      form={form}
      onSubmit={onFinish}
      buttonChildren="New"
      formSteps={[
        <>
          <StringFormItem label="Announcement Title" name="announcementTitle" isRequired />
          <StringFormItem label="Announcement Content" name="announcementContent" isRequired isTextArea />
        </>,
      ]}
    />
  );
}
