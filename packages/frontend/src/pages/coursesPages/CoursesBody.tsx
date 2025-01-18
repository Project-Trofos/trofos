import React, { useEffect, useState } from 'react';
import { useCurrentAndPastCourses } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Input, Spin, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';

export default function CoursesBody({
  currentPastOrFuture,
}: {
  currentPastOrFuture: 'cur' | 'past' | 'future';
}): JSX.Element {
  const [searchNameParam, setSearchNameParam] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchNameParam);
  const { currentCourses, pastCourses, futureCourses, isLoading } = useCurrentAndPastCourses({
    searchNameParam: debouncedSearch,
  });

  const coursesData =
    currentPastOrFuture === 'cur' ? currentCourses : currentPastOrFuture === 'past' ? pastCourses : futureCourses;

  const noCoursesText = currentPastOrFuture === 'cur' ? 'current' : currentPastOrFuture === 'past' ? 'past' : 'future';
  const tooltipText = (
    <>
      Projects are sorted in the order: <br />
      Course Year/Sem &gt; Course Name
    </>
  );

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

        <Tooltip placement="left" title={tooltipText}>
          <QuestionCircleOutlined style={{ color: 'grey', fontSize: 16 }} />
        </Tooltip>
      </div>
      {isLoading ? <Spin /> : getPane(coursesData, `There are no ${noCoursesText} courses.`)}
    </GenericBoxWithBackground>
  );
}
