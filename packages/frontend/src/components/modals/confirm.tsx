import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { getErrorMessage } from '../../helpers/error';

/**
 * Prompt for confirmation.
 *
 * @param content confirmation prompt
 * @param onOk callback function after user clicks ok
 * @param onCancel callback function after user clicks cancel
 * @returns modal's destroy and update function
 */
export default function confirm(content: string, onOk: () => Promise<void>, onCancel?: () => void) {
  return Modal.confirm({
    title: 'Confirm',
    icon: <ExclamationCircleOutlined />,
    content,
    onOk: async () => {
      try {
        await onOk();
      } catch (e) {
        message.error(getErrorMessage(e));
      }
    },
    onCancel,
  });
}

/**
 * Shows a modal with prompt for deleting a course.
 */
export function confirmDeleteCourse(onOk: () => Promise<void>) {
  return confirm(
    'Are you sure you want to delete this course? The projects under this course will become independent projects.',
    onOk,
  );
}

/**
 * Shows a modal with prompt for deleting a project.
 */
export function confirmDeleteProject(onOk: () => Promise<void>) {
  return confirm('Are you sure you want to delete this project?', onOk);
}

/**
 * Shows a modal with prompt for deleting a project.
 */
export function confirmDetachProject(onOk: () => Promise<void>) {
  return confirm('Are you sure you want to remove this project from this course?', onOk);
}
