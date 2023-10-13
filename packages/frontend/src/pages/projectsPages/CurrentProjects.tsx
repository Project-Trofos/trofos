import React from 'react';
import { useCurrentAndPastProjects } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Spin } from 'antd';

export default function CurrentProjects(): JSX.Element {
  const { currentProjects, isLoading } = useCurrentAndPastProjects();

  return isLoading ? <Spin /> : getPane(currentProjects, 'There are no current projects.');
}
