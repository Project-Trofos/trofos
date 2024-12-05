import React, { useEffect, useState } from 'react';
import { useCurrentAndPastProjects } from '../../api/hooks';
import getPane from '../../helpers/getPane';
import { Input, Spin } from 'antd';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';

export default function ProjectsBody({currentPastOrFuture}: {currentPastOrFuture: 'cur' | 'past' | 'future'}): JSX.Element {
  const [searchNameParam, setSearchNameParam] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchNameParam);
  const { currentProjects, pastProjects, futureProjects, isLoading } = useCurrentAndPastProjects({searchNameParam: debouncedSearch});

  const projectsData = currentPastOrFuture === 'cur' ? currentProjects
    : currentPastOrFuture === 'past' ? pastProjects : futureProjects;

  const noProjectsText = currentPastOrFuture === 'cur' ? 'current'
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
      {isLoading ? <Spin /> : getPane(projectsData, `There are no ${noProjectsText} projects.`)}
    </GenericBoxWithBackground>
  );
}
