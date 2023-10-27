import React from 'react';
import { useCurrentAndPastCourses } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Spin } from 'antd';

export default function PastCourses(): JSX.Element {
  const { pastCourses, isLoading } = useCurrentAndPastCourses();

  return isLoading ? <Spin /> : getPane(pastCourses, 'There are no past courses.');
}
