import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useGetBacklogHistoryQuery, useGetBacklogsQuery } from '../../api/backlog';
import { useCourse } from '../../api/hooks';
import { useGetSprintsQuery } from '../../api/sprint';
import CourseStatisticsCard from '../../components/cards/CourseStatisticsCard';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';
import CourseRetrospectiveInsightHubCard from '../../components/cards/CourseRetrospectiveInsightHubCard';
import LoadingComponent from '../../components/common/LoadingComponent';
import { useGetCourseProjectsLatestInsightsQuery } from '../../api/course';
import { useAppSelector } from '../../app/hooks';

export default function CourseStatistics(): JSX.Element {
  const params = useParams();
  const { filteredProjects, isLoading, course } = useCourse(params.courseId);

  const { data: backlogs, isLoading: isBacklogsLoading } = useGetBacklogsQuery();
  const { data: sprints, isLoading: isSprintsLoading } = useGetSprintsQuery();
  const { data: backlogHistory, isLoading: isHistoryLoading } = useGetBacklogHistoryQuery();
  const { data: projectsLatestSprintInsights, isLoading: isSprintInsightsLoading } = useGetCourseProjectsLatestInsightsQuery(course?.id || 0, { skip: !course });
  const seenSprintInsights = useAppSelector((state) => state.localSettingsSlice.seenRetrospectiveInsights);

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

  const projectIdsWithUnseenLatestSprintInsights = useMemo(() => {
    if (!projectsLatestSprintInsights) {
      return [];
    }
    return projectsLatestSprintInsights
      // Filter out sprints insights seen already
      .filter((project) => project.sprints &&
        project.sprints.length > 0 &&
        !(project.sprints[0].id.toString() in seenSprintInsights))
      .map((project) => project.id);
  }, [projectsLatestSprintInsights, seenSprintInsights]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Dashboard Overview',
      children: (isLoading || isBacklogsLoading || isHistoryLoading || isSprintsLoading) ?
        <LoadingComponent/> : (
        <CourseStatisticsCard
          projects={filteredProjects}
          sprints={sprintsInCourse}
          unassignedBacklogs={unassignedBacklogsInCourse}
          backlogHistory={backlogHistoryInCourse}
        />
      ),
    },
    {
      key: '2',
      label: 'Retrospective Insight Hub',
      children: (isSprintInsightsLoading) ?
        <LoadingComponent/> : (
        <CourseRetrospectiveInsightHubCard
          projectsLatestInsights={projectsLatestSprintInsights || []}
          projectIdsWithUnseenLatestSprintInsights={projectIdsWithUnseenLatestSprintInsights}
        />
      ),
      icon: (<Badge count={projectIdsWithUnseenLatestSprintInsights.length } />)
    },
  ];

  return (
    <GenericBoxWithBackground>
      <Tabs
        defaultActiveKey="1"
        items={items}
      />
    </GenericBoxWithBackground>
  );
}
