import React, { useState } from 'react';
import { Button, Typography, Row, Col } from 'antd';

import { getProjects, Project } from '../api/project';
import ProjectCard from '../components/ProjectCard';
import ProjectCreationModal from '../components/ProjectCreationModal';

const { Title, Paragraph } = Typography;

export default function ProjectsPage(): JSX.Element {
  const [projects] = useState<Project[]>(() => getProjects());
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  if (projects.length === 0) {
    return (
      <>
        <Title>Projects</Title>
        <Paragraph>It seems that you do not have a project yet...</Paragraph>
        <Button onClick={showModal} type="primary">
          Create Project
        </Button>
        <ProjectCreationModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
        <Title>Projects</Title>

        <Button onClick={showModal} type="primary">
          Create Project
        </Button>
      </div>

      <Row gutter={[16, 16]} wrap>
        {projects.map((project) => (
          <Col key={project.id}>
            <ProjectCard project={project} />
          </Col>
        ))}
      </Row>
      <ProjectCreationModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} />
    </>
  );
}
