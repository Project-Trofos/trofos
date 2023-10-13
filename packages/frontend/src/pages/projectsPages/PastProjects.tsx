import React from 'react';
import { useCurrentAndPastProjects } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Spin } from 'antd';

export default function PastProjects(): JSX.Element {
  const { pastProjects, isLoading } = useCurrentAndPastProjects();

  return isLoading ? <Spin /> : getPane(pastProjects, 'There are no past projects.');
}
