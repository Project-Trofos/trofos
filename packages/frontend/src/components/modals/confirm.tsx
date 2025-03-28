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
 * Shows a modal with prompt for archiving a project.
 */
export function confirmArchiveCourse(onOk: () => Promise<void>) {
  return confirm("Are you sure you want to archive this course? Course will be moved to 'Past Courses'", onOk);
}

/**
 * Shows a modal with prompt for unarchiving a course.
 */
export function confirmUnarchiveCourse(onOk: () => Promise<void>) {
  return confirm(
    "Are you sure you want to unarchive this course? Course will be moved to 'Current Courses' or 'Future Courses'",
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
 * Shows a modal with prompt for archiving a project.
 */
export function confirmArchiveProject(onOk: () => Promise<void>) {
  return confirm("Are you sure you want to archive this project? Project will be moved to 'Past Projects'", onOk);
}

/**
 * Shows a modal with prompt for unarchiving a project.
 */
export function confirmUnarchiveProject(onOk: () => Promise<void>) {
  return confirm(
    "Are you sure you want to unarchive this project? Project will be moved to 'Current Projects' or 'Future Projects'",
    onOk,
  );
}

/**
 * Shows a modal with prompt for deleting a project.
 */
export function confirmDeleteStandUp(onOk: () => Promise<void>) {
  return confirm('Are you sure you want to delete this stand up? All stand up notes will be lost.', onOk);
}

/**
 * Shows a modal with prompt for deleting a project.
 */
export function confirmUpdateStandUp(onOk: () => Promise<void>) {
  return confirm('All notes will be moved to the new stand up. Are you sure you want to update?', onOk);
}

/**
 * Shows a modal with prompt for deleting a project.
 */
export function confirmDetachProject(onOk: () => Promise<void>) {
  return confirm('Are you sure you want to remove this project from this course?', onOk);
}

/**
 * Shows a modal with prompt for deleting an announcement.
 */
export function confirmDeleteAnnouncement(onOk: () => Promise<void>) {
  return confirm('Are you sure you want to delete this announcement?', onOk);
}

/**
 * Shows a modal with prompt for deleting an retrospective.
 */
export function confirmDeleteRetrospective(onOk: () => Promise<void>) {
  return confirm('Are you sure you want to delete this retrospective item?', onOk);
}

/**
 * Shows a modal with prompt for inviting a user to a project.
 */
export function confirmInviteUserToProject(onOk: () => Promise<void>) {
  return confirm('Are you sure you want to invite this user?', onOk);
}

/**
 * Shows a modal with prompt for inviting a non-existing user to a project.
 */
export function confirmInviteNonExistingUserToProject(onOk: () => Promise<void>) {
  return confirm('User does not exist. Are you sure you want to invite this user?', onOk);
}

/**
 * Shows a modal with prompt for deleting an issue.
 */
export function confirmDeleteIssue(onOk: () => Promise<void>) {
  return confirm('Are you sure you want to delete this issue?', onOk);
}
