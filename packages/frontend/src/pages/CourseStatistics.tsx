import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetBacklogHistoryQuery, useGetBacklogsQuery } from '../api/backlog';
import { useCourse } from '../api/hooks';
import { useGetSprintsQuery } from '../api/sprint';
import CourseStatisticsCard from '../components/cards/CourseStatisticsCard';
import Container from '../components/layouts/Container';

export default function CourseStatistics(): JSX.Element {
  const params = useParams();
  const { filteredProjects } = useCourse(params.courseId);

  const { data: backlogs } = useGetBacklogsQuery();
  const { data: sprints } = useGetSprintsQuery();
  const { data: backlogHistory } = useGetBacklogHistoryQuery();

  const sprintsInCourse = useMemo(() => {
    if (!sprints) {
      return [];
    }
    const projectIds = filteredProjects.map((p) => p.id);

    return sprints.filter((s) => projectIds.includes(s.project_id));
  }, [sprints, filteredProjects]);

  const unassignedBacklogsInCourse = useMemo(() => {
    if (!backlogs) {
      return [];
    }
    const projectIds = filteredProjects.map((p) => p.id);

    return backlogs.filter((b) => projectIds.includes(b.project_id)).filter((b) => b.sprint_id === null);
  }, [backlogs, filteredProjects]);

  const backlogHistoryInCourse = useMemo(() => {
    if (!backlogHistory) {
      return [];
    }
    const sprintIds = sprintsInCourse.map((s) => s.id);
    return backlogHistory.filter((b) => b.sprint_id && sprintIds.includes(b.sprint_id));
  }, [sprintsInCourse, backlogHistory]);

  return (
    <Container>
      <CourseStatisticsCard
        projects={filteredProjects}
        sprints={sprintsInCourse}
        unassignedBacklogs={unassignedBacklogsInCourse}
        backlogHistory={backlogHistoryInCourse}
      />
    </Container>
  );
}
