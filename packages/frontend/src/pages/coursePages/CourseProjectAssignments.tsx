import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCourse, useProject } from '../../api/hooks';
import { Button, Card, Col, Collapse, CollapseProps, Flex, message, Row, Select, Space, Spin, Typography } from 'antd';
import { ProjectData, Project } from '../../api/types';
import { useAssignProjectMutation, useRemoveProjectAssignmentMutation } from '../../api/project';
import { getErrorMessage } from '../../helpers/error';
import { DeleteOutlined } from '@ant-design/icons';
import ImportProjectAssignmentModal from '../../components/modals/ImportProjectAssignmentModal';

const { Title } = Typography;

export default function CourseProjectAssignments(): JSX.Element {
  const params = useParams();
  const { filteredProjects, isLoading } = useCourse(params.courseId);
  const sortedProjects = filteredProjects.sort((a, b) => a.pname.localeCompare(b.pname));

  if (isLoading) {
    return <Spin />;
  }

  const items: CollapseProps['items'] = sortedProjects.map((project) => ({
    label: project.pname,
    key: project.id,
    children: <ProjectAssignmentCardContent project={project} />,
    extra: <ProjectsSelector project={project} projects={sortedProjects} />,
  }));

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Flex justify="flex-end">
        <ImportProjectAssignmentModal />
      </Flex>
      <Collapse items={items} />
    </Space>
  );
}

const ProjectAssignmentCardContent = ({ project }: { project: ProjectData }) => {
  const { assignedProjects } = useProject(project.id);
  const [removeProjectAssignment] = useRemoveProjectAssignmentMutation();

  if (!assignedProjects || assignedProjects.length === 0) {
    return <Row>This project is not assigned to any other project.</Row>;
  }

  const handleRemoveAssignment = async (id: number) => {
    try {
      await removeProjectAssignment({ projectId: project.id, projectAssignmentId: id }).unwrap();
      message.success(`Removed project assignment successfully`);
    } catch (error) {
      message.error(`Failed to remove project assignment: ${getErrorMessage(error)}`);
    }
  };

  return (
    <>
      <Title level={5}>Assigned Projects</Title>
      {assignedProjects?.map(({ id, targetProject: project }) => (
        <Card size="small" key={id}>
          <Row gutter={[16, 16]} itemType="flex" align="middle">
            <Col span={20}>{project.pname}</Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveAssignment(id)} />
            </Col>
          </Row>
        </Card>
      ))}
    </>
  );
};

const ProjectsSelector = ({ project, projects }: { project: ProjectData; projects: ProjectData[] }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { assignedProjects } = useProject(project.id);
  const [assignProject, { isLoading }] = useAssignProjectMutation();

  const handleAssignProject = async () => {
    if (!selectedProjectId) {
      message.error('Please select a project');
      return;
    }

    try {
      await assignProject({ projectId: project.id, targetProjectId: selectedProjectId }).unwrap();
      message.success(`Assigned to Project ${project.pname} successfully`);
      setSelectedProjectId(null);
    } catch (error) {
      message.error(`Failed to assign project: ${getErrorMessage(error)}`);
    }
  };

  const options = useMemo(() => {
    if (!assignedProjects) return [];

    return projects
      .filter((p) => p.id !== project.id && !assignedProjects.find((a) => a.targetProject.id === p.id))
      .map((p) => ({ value: p.id, label: p.pname }));
  }, [projects, project, assignedProjects]);

  return (
    <Row gutter={[8, 8]} align="middle">
      <Col flex="auto">
        <Select
          value={selectedProjectId}
          onChange={setSelectedProjectId}
          options={options}
          placeholder="Select project"
          style={{ width: '100%' }}
        />
      </Col>
      <Col>
        <Button type="primary" onClick={handleAssignProject} loading={isLoading} disabled={!selectedProjectId}>
          Assign
        </Button>
      </Col>
    </Row>
  );
};
