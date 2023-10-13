import React from 'react';
import { useCurrentAndPastCourses } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Spin } from 'antd';

export default function CurrentCourses(): JSX.Element {
  const { currentCourses, isLoading } = useCurrentAndPastCourses();

  return isLoading ? <Spin /> : getPane(currentCourses, 'There are no current courses.');
}
