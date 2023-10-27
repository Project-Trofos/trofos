import React from 'react';
import { useCurrentAndPastProjects } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Spin } from 'antd';

export default function FutureProjects(): JSX.Element {
  const { futureProjects, isLoading } = useCurrentAndPastProjects();

  return isLoading ? <Spin /> : getPane(futureProjects, 'There are no future projects.');
}
