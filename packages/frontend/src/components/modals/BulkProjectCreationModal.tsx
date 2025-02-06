import React, { useMemo, useState } from 'react';
import { Button, InputNumber, List, message, Modal, Space, Typography } from 'antd';
import { CourseData, ProjectData, UserData } from '../../api/types';
import { useBulkCreateProjectsMutation } from '../../api/course';
import { shuffleArray } from '../../helpers/random';

import './BulkProjectCreationModal.css';
import { getErrorMessage } from '../../helpers/error';
import UserTable from '../tables/UserTable';
import { useCourse } from '../../api/hooks';
import { STUDENT_ROLE_ID } from '../../api/role';
import { STEP_PROP, StepTarget } from '../tour/TourSteps';

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
}: {
  course: CourseData;
  projects: ProjectData[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allocations, setAllocations] = useState<ProjectAllocation>([]);
  const [usersPerGroup, setUsersPerGroup] = useState<number | null>(null);
  const [bulkCreateProject] = useBulkCreateProjectsMutation();

  const { courseUserRoles } = useCourse(course.id.toString());

  const [selectedUsers, setSelectedUsers] = useState<React.Key[]>([]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      if (allocations.length === 0) {
        setIsModalOpen(false);
        return;
      }
      await bulkCreateProject({
        courseId: course.id.toString(),
        courseName: course.cname,
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
      message.error('Unable to create projects!');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const studentsWithoutProject: UserData[] = useMemo(() => {
    // Users without project
    const users = course.users.filter(
      (u) => !projects.some((p) => p.users.some((pu) => pu.user.user_id === u.user.user_id)),
    );
    // Only users with student role
    return users.filter((u) =>
      courseUserRoles?.find((c) => c.role_id === STUDENT_ROLE_ID && c.user_id === u.user.user_id),
    );
  }, [course, projects, courseUserRoles]);

  const generate = () => {
    if (!usersPerGroup) {
      return [];
    }
    const targetUsers = studentsWithoutProject.filter((u) =>
      selectedUsers.map((s) => Number(s)).includes(u.user.user_id),
    );
    const shuffledUsers = shuffleArray(targetUsers);

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
  };

  return (
    <>
      <Button onClick={showModal} {...{ [STEP_PROP]: StepTarget.BULK_CREATE_BUTTON }}>
        Bulk Create
      </Button>
      <Modal title="Bulk Project Creation" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        {studentsWithoutProject.length === 0 ? (
          <Space>
            <Typography.Text>There are no students without a project!</Typography.Text>
          </Space>
        ) : (
          <>
            <UserTable
              users={studentsWithoutProject}
              userRoles={courseUserRoles}
              onlyShowActions={['ROLE']}
              showSelect
              onSelectChange={(e) => setSelectedUsers(e)}
              footer={`You have selected ${selectedUsers.length} user(s).`}
            />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Typography.Text>Number of students in a project:</Typography.Text>
                <InputNumber size="small" min={1} onChange={(value) => setUsersPerGroup(value)} />
                <Button size="small" onClick={() => setAllocations(generate())}>
                  Generate
                </Button>
              </Space>
              {allocations.map((a) => (
                <List
                  className="bulk-project-creation-modal-list"
                  header={a.name}
                  bordered
                  key={a.name}
                  dataSource={a.users}
                  renderItem={(item) => <List.Item>{item.user.user_display_name}</List.Item>}
                  data-testid="bulk-project-creation-list"
                />
              ))}
            </Space>
          </>
        )}
      </Modal>
    </>
  );
}
