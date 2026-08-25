import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu, ConfigProvider } from 'antd';
import { useCourse } from '../../api/hooks';
import { useCourseActions, useIsCourseManager } from '../../api/hooks/roleHooks';
import { canDisplay } from '../../helpers/conditionalRender';
import { GRADING_ACCESS_ACTIONS } from '../../helpers/constants';
import { useGetFeatureFlagsQuery } from '../../api/featureFlag';
import LoadingComponent from '../common/LoadingComponent';

export default function CourseMenu(): JSX.Element {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedTab = useMemo(() => {
    // Current location split [course, :courseId, :tabName]
    const split = location.pathname.split('/');
    return split[3];
  }, [location.pathname]);

  const { course, isLoading } = useCourse(params.courseId);
  const { isCourseManager } = useIsCourseManager();
  const courseId = Number(course?.id) || -1;
  const { actions } = useCourseActions({ courseId });
  const { data: featureFlags } = useGetFeatureFlagsQuery();
  const isGradingMatrixEnabled = featureFlags?.some((flag) => flag.feature_name === 'grading_matrix' && flag.active);
  const canSeeGrading = isGradingMatrixEnabled && canDisplay(actions || [], GRADING_ACCESS_ACTIONS);

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            darkItemBg: 'rgb(10,10,10)',
            itemBg: '',
          },
        },
      }}
    >
      <Menu
        style={{ border: 'none' }}
        mode="horizontal"
        items={[
          { key: 'overview', label: 'Overview' },
          { key: 'users', label: 'Users' },
          ...(canSeeGrading ? [{ key: 'grading', label: 'Grading' }] : []),
          ...(isCourseManager
            ? [
                { key: 'milestones', label: 'Milestones' },
                { key: 'statistics', label: 'Statistics' },
                { key: 'settings', label: 'Settings' },
              ]
            : []),
        ]}
        selectedKeys={[selectedTab]}
        onClick={(e) => navigate(`/course/${courseId}/${e.key}`)}
      />
    </ConfigProvider>
  );
}
