import AnnouncementCard from '../../components/cards/AnnouncementCard';
import MilestoneCard from '../../components/cards/MilestoneCard';
import Container from '../../components/layouts/Container';
import BulkProjectCreationModal from '../../components/modals/BulkProjectCreationModal';
import ProjectTable from '../../components/tables/ProjectTable';
import { Card } from 'antd';
import { exampleCourse, exampleProjects } from './example';

export default function CourseOverviewExample(): JSX.Element {
  const course = exampleCourse;
  const projects = exampleProjects;

  return (
    <Container>
      <AnnouncementCard
        course={course}
        handleDeleteAnnouncement={async (announcementId: number) => {}}
        handleUpdateAnnouncement={async (announcementId: number) => {}}
      />
      {course && <MilestoneCard course={course} />}
      <Card>
        <ProjectTable
          projects={projects}
          control={course && <BulkProjectCreationModal course={course} projects={[]} />}
          disableClickEvent={true}
        />
      </Card>
    </Container>
  );
}
