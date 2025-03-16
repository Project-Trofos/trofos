import React, { useEffect, useState } from 'react';
import { useCurrentAndPastCourses } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Input, Space } from 'antd';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';
import ToggleButtonGroup from '../../components/button/ToggleButtons';
import LoadingComponent from '../../components/common/LoadingComponent';

export const sortOptions = {
  SORT_BY_COURSE: 'course',
  SORT_BY_YEAR: 'year',
};

export default function CoursesBody({
  currentPastOrFuture,
}: {
  currentPastOrFuture: 'cur' | 'past' | 'future';
}): JSX.Element {
  const [searchNameParam, setSearchNameParam] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchNameParam);
  const [toggleValue, setToggleValue] = useState<string | null>(null);
  const { currentCourses, pastCourses, futureCourses, isLoading } = useCurrentAndPastCourses({
    searchNameParam: debouncedSearch,
    sortOption: toggleValue ?? undefined,
  });

  const coursesData =
    currentPastOrFuture === 'cur' ? currentCourses : currentPastOrFuture === 'past' ? pastCourses : futureCourses;

  const noCoursesText = currentPastOrFuture === 'cur' ? 'current' : currentPastOrFuture === 'past' ? 'past' : 'future';

  // Debounce the search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchNameParam);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchNameParam]);

  return (
    <GenericBoxWithBackground style={{ minHeight: '40vh' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Input
          placeholder="Search Course by name"
          value={searchNameParam}
          onChange={(e) => {
            setSearchNameParam(e.target.value);
          }}
          style={{ maxWidth: '30%' }}
        />
        <Space>
          <ToggleButtonGroup
            titles={[sortOptions.SORT_BY_COURSE, sortOptions.SORT_BY_YEAR]}
            onToggle={setToggleValue}
          />
        </Space>
      </div>
      {isLoading ? <LoadingComponent /> : getPane(coursesData, `There are no ${noCoursesText} courses.`)}
    </GenericBoxWithBackground>
  );
}
