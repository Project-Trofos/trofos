import React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

/**
 * Prompt for confirmation.
 * 
 * @param content confirmation prompt
 * @param onOk callback function after user clicks ok
 * @param onCancel callback function after user clicks cancel
 * @returns modal's destroy and update function
 */
export default function confirm(content: string, onOk: () => void, onCancel?: () => void) {
  return Modal.confirm({
    title: 'Confirm',
    icon: <ExclamationCircleOutlined />,
    content,
    onOk,
    onCancel,
  });
}

/**
 * Shows a modal with prompt for deleting a course.
 */
export function confirmDeleteCourse(onOk: () => void) {
  return confirm('Are you sure you want to delete this course? The projects under this course will become independent projects.', onOk);
}

/**
 * Shows a modal with prompt for deleting a project.
 */
export function confirmDeleteProject(onOk: () => void) {
  return confirm('Are you sure you want to delete this project?', onOk);
}

/**
 * Shows a modal with prompt for deleting a project.
 */
export function confirmDetachProject(onOk: () => void) {
  return confirm('Are you sure you want to remove this project from this course?', onOk);
}