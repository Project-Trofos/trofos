import { Card, Space, message } from 'antd';
import Container from '../../components/layouts/Container';
import UserTable from '../../components/tables/UserTable';
import { exampleProject } from './example';

export default function ProjectPeopleExample(): JSX.Element {
  const project = exampleProject;

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card>
          <UserTable heading="Users" users={project?.users} ownerId={project?.owner_id} />
        </Card>
      </Space>
    </Container>
  );
}
