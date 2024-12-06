import React, { useEffect, useState } from 'react';
import { useCurrentAndPastCourses } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Input, Spin } from 'antd';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';

export default function CoursesBody({currentPastOrFuture}: {currentPastOrFuture: 'cur' | 'past' | 'future'}): JSX.Element {
  const [searchNameParam, setSearchNameParam] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchNameParam);
  const { currentCourses, pastCourses, futureCourses, isLoading } = useCurrentAndPastCourses({searchNameParam: debouncedSearch});

  const coursesData = currentPastOrFuture === 'cur' ? currentCourses
    : currentPastOrFuture === 'past' ? pastCourses : futureCourses;

  const noCoursesText = currentPastOrFuture === 'cur' ? 'current'
  : currentPastOrFuture === 'past' ? 'past' : 'future';

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
    <GenericBoxWithBackground style={{ minHeight:'40vh'}}>
      <Input
        placeholder='Search Project by name'
        value={searchNameParam}
        onChange={(e) => {setSearchNameParam(e.target.value)}}
        style={{ maxWidth: '30%' }}
      />
      {isLoading ? <Spin /> : getPane(coursesData, `There are no ${noCoursesText} courses.`)}
    </GenericBoxWithBackground>
  );
}
