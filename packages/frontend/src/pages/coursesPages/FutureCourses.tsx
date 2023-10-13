import React from 'react';
import { useCurrentAndPastCourses } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Spin } from 'antd';

export default function FutureCourses(): JSX.Element {
  const { futureCourses, isLoading } = useCurrentAndPastCourses();

  return isLoading ? <Spin /> : getPane(futureCourses, 'There are no future courses.');
}
