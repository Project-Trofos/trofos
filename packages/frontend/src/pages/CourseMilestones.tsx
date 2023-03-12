import { Card, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '../api/hooks';
import { useGetSprintsQuery } from '../api/sprint';
import { Milestone } from '../api/types';
import MilestoneCard from '../components/cards/MilestoneCard';
import Container from '../components/layouts/Container';
import SprintTable from '../components/tables/SprintTable';

export default function CourseMilestones(): JSX.Element {
  const params = useParams();
  const { filteredProjects, course } = useCourse(params.courseId);

  const { data: sprints } = useGetSprintsQuery();

  const sprintsInCourse = useMemo(() => {
    if (!sprints) {
      return [];
    }
    const projectIds = filteredProjects.map((p) => p.id);

    return sprints.filter((s) => projectIds.includes(s.project_id));
  }, [sprints, filteredProjects]);

  return (
    <Container>
      {course && <MilestoneCard course={course} showEdit />}
      <Card>
        <SprintTableByMilestone sprints={sprintsInCourse} projects={filteredProjects} milestones={course?.milestones} />
      </Card>
    </Container>
  );
}

function SprintTableByMilestone(
  props: Omit<React.ComponentProps<typeof SprintTable>, 'heading' | 'control'> & {
    milestones: Milestone[] | undefined;
  },
) {
  const { milestones, projects, sprints, isLoading } = props;

  const [milestoneId, setMilestoneId] = useState<number>();

  function isDateSameOrBefore(d1: Dayjs, d2: Dayjs) {
    return d1.isSame(d2) || d1.isBefore(d2);
  }

  // Define sprints inside a milestone as a sprint which begins during the milestone
  const sprintsByMilestone = useMemo(() => {
    if (!sprints || !milestones) {
      return [];
    }

    return milestones.map((m) => {
      return {
        milestoneId: m.id,
        sprints: sprints.filter((s) => {
          const sprintStartDate = dayjs(s.start_date);
          return (
            isDateSameOrBefore(dayjs(m.start_date), sprintStartDate) &&
            isDateSameOrBefore(sprintStartDate, dayjs(m.deadline))
          );
        }),
      };
    });
  }, [sprints, milestones]);

  const options = useMemo(() => {
    return milestones?.map((m) => ({ value: m.id, label: m.name })) ?? [];
  }, [milestones]);

  return (
    <SprintTable
      sprints={sprintsByMilestone.find((s) => s.milestoneId === milestoneId)?.sprints}
      projects={projects}
      heading="Sprints in milestone"
      control={
        <Select
          style={{ width: '200px' }}
          options={options}
          placeholder="Select a milestone"
          onChange={(e) => setMilestoneId(e)}
        />
      }
      isLoading={isLoading}
    />
  );
}
