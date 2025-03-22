import React from 'react';
import { Collapse, Row, Col, Button, Tag, Space, Divider } from 'antd';
import { Heading } from '../typography';
import { useGetAllCoursesQuery, useRemoveCourseUserMutation } from '../../api/course';
import { useGetAllProjectsQuery, useRemoveProjectUserMutation } from '../../api/project';
import { useGetUserInfoQuery, UserInfo } from '../../api/auth';
import { CourseData, ProjectData } from '../../api/types';
import './UserAccess.css';
import CustomPaginationFooter from '../tables/CustomPaginationFooter';

const { Panel } = Collapse;

const NO_USER_ID_FOUND = -1;

export default function UserAccessTab(): JSX.Element {
  const [coursesPageSize, setCoursesPageSize] = React.useState(10);
  const [coursesPageIndex, setCoursesPageIndex] = React.useState(0);
  const [projectsPageSize, setProjectsPageSize] = React.useState(10);
  const [projectsPageIndex, setProjectsPageIndex] = React.useState(0);
  const { data: courses } = useGetAllCoursesQuery({
    pageIndex: coursesPageIndex,
    pageSize: coursesPageSize,
  });
  const { data: projects } = useGetAllProjectsQuery({
    pageIndex: projectsPageIndex,
    pageSize: projectsPageSize
  });
  const { data: userData } = useGetUserInfoQuery();
  const [removeUserFromCourse] = useRemoveCourseUserMutation();
  const [removeUserFromProject] = useRemoveProjectUserMutation();

  const courseEntry = (course: CourseData, userInfo: UserInfo | undefined) => (
    <Row className="entry" key={course.id}>
      <strong>{course.cname}</strong>
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
    <Row className="entry" key={project.id}>
      <strong>{project.pname}</strong>
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
              {courses?.data?.map((course) => courseEntry(course, userData))}
            </Space>
            <Divider />
            <CustomPaginationFooter
              pageIndex={coursesPageIndex}
              pageSize={coursesPageSize}
              setPageSize={setCoursesPageSize}
              setPageIndex={setCoursesPageIndex}
              totalRowCount={courses?.totalCount || 0}
            />
          </Panel>
          <Panel header="Projects" key="projects">
            <Space direction="vertical" style={{ width: '100%' }}>
              {projects?.data?.map((project) => projectEntry(project, userData))}
            </Space>
            <Divider />
            <CustomPaginationFooter
              pageIndex={projectsPageIndex}
              pageSize={projectsPageSize}
              setPageSize={setProjectsPageSize}
              setPageIndex={setProjectsPageIndex}
              totalRowCount={projects?.totalCount || 0}
            />
          </Panel>
        </Collapse>
      </Col>
    </Row>
  );
}
