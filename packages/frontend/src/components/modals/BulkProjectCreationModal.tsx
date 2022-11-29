import React, { useCallback, useMemo, useState } from 'react';
import { Button, InputNumber, List, message, Modal, Space, Typography } from 'antd';
import { CourseData, ProjectData, UserData } from '../../api/types';
import { useBulkCreateProjectsMutation } from '../../api/course';
import { shuffleArray } from '../../helpers/random';

import './BulkProjectCreationModal.css';
import { UserInfo } from '../../api/auth';
import { getErrorMessage } from '../../helpers/error';

type ProjectAllocation = {
  name: string;
  users: UserData[];
}[];

/**
 * Modal for bulk creation of projects based
 */
export default function BulkProjectCreationModal({
  course,
  projects,
  currentUserInfo,
}: {
  course: CourseData | undefined;
  projects: ProjectData[] | undefined;
  currentUserInfo: UserInfo | undefined;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocations, setAllocations] = useState<ProjectAllocation>([]);
  const [usersPerGroup, setUsersPerGroup] = useState<number | null>(null);
  const [bulkCreateProject] = useBulkCreateProjectsMutation();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      if (!course || allocations.length === 0) {
        setIsModalOpen(false);
        return;
      }
      await bulkCreateProject({
        courseId: course.id,
        courseName: course.cname,
        courseYear: course.year,
        courseSem: course.sem,
        isPublic: course.public,
        projects: allocations.map((p) => ({
          projectName: p.name,
          users: p.users.map((u) => ({ userId: u.user.user_id })),
        })),
      }).unwrap();
      setIsModalOpen(false);
      message.success('Projects created!');
    } catch (e) {
      console.error(getErrorMessage(e));
      message.error('Unable to create projects! Please contact system administrator.');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const usersWithoutProject: UserData[] = useMemo(() => {
    if (!course || !projects) {
      return [];
    }
    // Users without project
    const users = course.users.filter(
      (u) => !projects.some((p) => p.users.some((pu) => pu.user.user_id === u.user.user_id)),
    );
    // Current user will not be included
    return users.filter((u) => u.user.user_id !== currentUserInfo?.userId);
  }, [course, projects, currentUserInfo]);

  const generate = useCallback(() => {
    if (!course || !usersPerGroup) {
      return [];
    }
    const shuffledUsers = shuffleArray(usersWithoutProject);

    const groups: ProjectAllocation = [];
    let index = 0;
    let groupIndex = 1;
    while (index < shuffledUsers.length) {
      const users = [];
      for (let i = 0; i < usersPerGroup; i += 1) {
        if (index >= shuffledUsers.length) {
          break;
        }
        users.push(shuffledUsers[index]);
        index += 1;
      }
      groups.push({ name: `Group ${groupIndex}`, users });
      groupIndex += 1;
    }
    return groups;
  }, [course, usersPerGroup, usersWithoutProject]);

  return (
    <>
      <Button onClick={showModal}>Bulk Create</Button>
      <Modal title="Bulk Project Creation" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Paragraph>Students without a project will be assigned a project randomly.</Typography.Paragraph>
          {usersWithoutProject.length === 0 ? (
            <Space>
              <Typography.Text>There are no students without a project!</Typography.Text>
            </Space>
          ) : (
            <>
              <Space>
                <Typography.Text>Number of students in a project:</Typography.Text>
                <InputNumber min={1} onChange={(value) => setUsersPerGroup(value)} />
                <Button onClick={() => setAllocations(generate())}>Generate</Button>
              </Space>
              {allocations.map((a, index) => (
                <List
                  className="bulk-project-creation-modal-list"
                  header={a.name}
                  bordered
                  key={a.name}
                  dataSource={a.users}
                  renderItem={(item) => <List.Item>{item.user.user_email}</List.Item>}
                />
              ))}
            </>
          )}
        </Space>
      </Modal>
    </>
  );
}
