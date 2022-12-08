import React from 'react';
import { Collapse, Row, Col, Button, Tag, Space } from 'antd';
import { Heading } from '../typography';
import { useGetAllCoursesQuery, useRemoveCourseUserMutation } from '../../api/course';
import { useGetAllProjectsQuery, useRemoveProjectUserMutation } from '../../api/project';
import { useGetUserInfoQuery, UserInfo } from '../../api/auth';
import { CourseData, ProjectData } from '../../api/types';
import './UserAccess.css';

const { Panel } = Collapse;

const NO_USER_ID_FOUND = -1;

export default function UserAccessTab(): JSX.Element {
  const { data: courses } = useGetAllCoursesQuery();
  const { data: projects } = useGetAllProjectsQuery();
  const { data: userData } = useGetUserInfoQuery();
  const [removeUserFromCourse] = useRemoveCourseUserMutation();
  const [removeUserFromProject] = useRemoveProjectUserMutation();

  const courseEntry = (course: CourseData, userInfo: UserInfo | undefined) => (
    <Row className="entry">
      <h1>{course.cname}</h1>
      <Tag color="green">{course.id}</Tag>
      <Tag>{`${course.startYear} Semester ${course.startSem}`}</Tag>
      <Button
        danger
        onClick={() =>
          removeUserFromCourse({
            id: course.id,
            userId: userInfo?.userId || NO_USER_ID_FOUND,
          })
        }
      >
        Leave
      </Button>
    </Row>
  );

  const projectEntry = (project: ProjectData, userInfo: UserInfo | undefined) => (
    <Row className="entry">
      <h1>{project.pname}</h1>
      <Button
        danger
        onClick={() =>
          removeUserFromProject({
            id: project.id,
            userId: userInfo?.userId || NO_USER_ID_FOUND,
          })
        }
      >
        Leave
      </Button>
    </Row>
  );

  return (
    <Row>
      <Col offset={6} span={12}>
        <Heading>Access Management</Heading>
        <Collapse>
          <Panel header="Courses" key="courses">
            <Space direction="vertical" style={{ width: '100%' }}>
              {courses?.map((course) => courseEntry(course, userData))}
            </Space>
          </Panel>
          <Panel header="Projects" key="projects">
            <Space direction="vertical" style={{ width: '100%' }}>
              {projects?.map((project) => projectEntry(project, userData))}
            </Space>
          </Panel>
        </Collapse>
      </Col>
    </Row>
  );
}
